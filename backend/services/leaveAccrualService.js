const { sequelize, Employee, LeaveBalance, LeaveAccrualLog, Leave } = require('../models');
const { Op } = require('sequelize');

class LeaveAccrualService {
  // Main accrual function - runs monthly
  static async processMonthlyAccrual(targetDate = null) {
    const transaction = await sequelize.transaction();
    
    try {
      const accrualDate = targetDate || new Date();
      const currentYear = accrualDate.getFullYear();
      const currentMonth = accrualDate.getMonth() + 1;
      
      console.log(`🔄 Processing leave accrual for ${accrualDate.toISOString().split('T')[0]}`);
      
      // Get all active employees
      const employees = await Employee.findAll({
        where: {
          status: 'active',
          employment_date: {
            [Op.lte]: accrualDate // Only employees hired before accrual date
          }
        },
        include: [{
          model: LeaveBalance,
          as: 'leave_balance',
          required: false
        }]
      });
      
      let processedCount = 0;
      let skippedCount = 0;
      
      for (const employee of employees) {
        // Check if already accrued for this month
        const alreadyAccrued = await LeaveAccrualLog.findOne({
          where: {
            employee_id: employee.id,
            accrual_year: currentYear,
            accrual_month: currentMonth
          }
        });
        
        if (alreadyAccrued) {
          console.log(`⏭️  Skipping ${employee.full_name} - already accrued for ${currentYear}-${currentMonth}`);
          skippedCount++;
          continue;
        }
        
        // Check if employee has reached accrual date based on employment
        const employmentDate = new Date(employee.employment_date);
        const daysSinceEmployment = Math.floor((accrualDate - employmentDate) / (1000 * 60 * 60 * 24));
        
        // Only start accruing after probation period (e.g., 90 days)
        if (daysSinceEmployment < 90) {
          console.log(`⏭️  ${employee.full_name} still in probation period (${daysSinceEmployment} days)`);
          skippedCount++;
          continue;
        }
        
        // Process accrual for this employee
        await this.accrueForEmployee(employee, accrualDate, currentYear, currentMonth, transaction);
        processedCount++;
      }
      
      await transaction.commit();
      
      console.log(`✅ Leave accrual completed: ${processedCount} employees processed, ${skippedCount} skipped`);
      
      return {
        success: true,
        processedCount,
        skippedCount,
        date: accrualDate
      };
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error processing leave accrual:', error);
      throw error;
    }
  }
  
  // Accrue leave for a single employee
  static async accrueForEmployee(employee, accrualDate, year, month, transaction) {
    try {
      // Get or create leave balance
      let balance = await LeaveBalance.findOne({
        where: { employee_id: employee.id },
        transaction
      });
      
      if (!balance) {
        balance = await LeaveBalance.create({
          employee_id: employee.id,
          year: year,
          last_accrual_date: employee.employment_date,
          next_accrual_date: this.getNextAccrualDate(employee.employment_date)
        }, { transaction });
      }
      
      // Calculate accrual amounts based on tenure
      const tenureYears = this.calculateTenure(employee.employment_date, accrualDate);
      const accrualRates = this.getAccrualRatesByTenure(tenureYears);
      
      // Store previous balances
      const prevVacationBalance = parseFloat(balance.vacation_balance || 0);
      const prevSickBalance = parseFloat(balance.sick_balance || 0);
      const prevPersonalBalance = parseFloat(balance.personal_balance || 0);
      
      // Calculate new accruals
      const vacationAccrual = accrualRates.vacation;
      const sickAccrual = accrualRates.sick;
      const personalAccrual = accrualRates.personal;
      
      // Update balances
      const newVacationTotal = parseFloat(balance.vacation_total_accrued || 0) + vacationAccrual;
      const newVacationBalance = Math.min(
        prevVacationBalance + vacationAccrual,
        balance.max_vacation_balance || 30
      );
      
      const newSickTotal = parseFloat(balance.sick_total_accrued || 0) + sickAccrual;
      const newSickBalance = prevSickBalance + sickAccrual;
      
      const newPersonalTotal = parseFloat(balance.personal_total_accrued || 0) + personalAccrual;
      const newPersonalBalance = prevPersonalBalance + personalAccrual;
      
      // Update balance record
      await balance.update({
        vacation_total_accrued: newVacationTotal,
        vacation_balance: newVacationBalance,
        sick_total_accrued: newSickTotal,
        sick_balance: newSickBalance,
        personal_total_accrued: newPersonalTotal,
        personal_balance: newPersonalBalance,
        last_accrual_date: accrualDate,
        next_accrual_date: this.getNextAccrualDate(accrualDate),
        updated_at: new Date()
      }, { transaction });
      
      // Log vacation accrual
      await LeaveAccrualLog.create({
        employee_id: employee.id,
        accrual_date: accrualDate,
        leave_type: 'vacation',
        days_accrued: vacationAccrual,
        previous_balance: prevVacationBalance,
        new_balance: newVacationBalance,
        accrual_month: month,
        accrual_year: year,
        notes: `Monthly accrual - ${tenureYears.toFixed(1)} years tenure`,
        processed_by: 'system'
      }, { transaction });
      
      // Log sick accrual
      await LeaveAccrualLog.create({
        employee_id: employee.id,
        accrual_date: accrualDate,
        leave_type: 'sick',
        days_accrued: sickAccrual,
        previous_balance: prevSickBalance,
        new_balance: newSickBalance,
        accrual_month: month,
        accrual_year: year,
        notes: `Monthly accrual - ${tenureYears.toFixed(1)} years tenure`,
        processed_by: 'system'
      }, { transaction });
      
      // Log personal accrual
      await LeaveAccrualLog.create({
        employee_id: employee.id,
        accrual_date: accrualDate,
        leave_type: 'personal',
        days_accrued: personalAccrual,
        previous_balance: prevPersonalBalance,
        new_balance: newPersonalBalance,
        accrual_month: month,
        accrual_year: year,
        notes: `Monthly accrual - ${tenureYears.toFixed(1)} years tenure`,
        processed_by: 'system'
      }, { transaction });
      
      console.log(`✅ Accrued for ${employee.full_name}: +${vacationAccrual} vacation, +${sickAccrual} sick, +${personalAccrual} personal`);
      
      return true;
    } catch (error) {
      console.error(`Error accruing for employee ${employee.id}:`, error);
      throw error;
    }
  }
  
  // Calculate tenure in years
  static calculateTenure(employmentDate, currentDate) {
    const start = new Date(employmentDate);
    const end = new Date(currentDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays / 365.25;
  }
  
  // Get accrual rates based on tenure
  static getAccrualRatesByTenure(tenureYears) {
    // Base rates (days per month)
    let vacationRate = 1.25;  // 15 days/year
    let sickRate = 1.0;        // 12 days/year
    let personalRate = 0.5;    // 6 days/year
    
    // Increase vacation for long-term employees
    if (tenureYears >= 5) {
      vacationRate = 1.67;  // 20 days/year
    } else if (tenureYears >= 3) {
      vacationRate = 1.5;    // 18 days/year
    } else if (tenureYears >= 1) {
      vacationRate = 1.33;   // 16 days/year
    }
    
    return {
      vacation: vacationRate,
      sick: sickRate,
      personal: personalRate
    };
  }
  
  // Get next accrual date (next month same day)
  static getNextAccrualDate(currentDate) {
    const date = new Date(currentDate);
    date.setMonth(date.getMonth() + 1);
    return date;
  }
  
  // Get employee leave summary
  static async getEmployeeLeaveSummary(employeeId) {
    try {
      const balance = await LeaveBalance.findOne({
        where: { employee_id: employeeId }
      });
      
      if (!balance) {
        return null;
      }
      
      // Get recent accruals
      const recentAccruals = await LeaveAccrualLog.findAll({
        where: { employee_id: employeeId },
        order: [['accrual_date', 'DESC']],
        limit: 12
      });
      
      // Get leave history
      const leaveHistory = await Leave.findAll({
        where: {
          employee_id: employeeId,
          status: 'approved'
        },
        order: [['start_date', 'DESC']],
        limit: 10
      });
      
      // Calculate yearly projections
      const currentYear = new Date().getFullYear();
      const yearlyUsage = await Leave.findAll({
        where: {
          employee_id: employeeId,
          status: 'approved',
          start_date: {
            [Op.between]: [`${currentYear}-01-01`, `${currentYear}-12-31`]
          }
        },
        attributes: [
          'leave_type',
          [sequelize.fn('SUM', sequelize.col('total_days')), 'total_used']
        ],
        group: ['leave_type']
      });
      
      return {
        balances: {
          vacation: {
            total_accrued: balance.vacation_total_accrued,
            used: balance.vacation_used,
            balance: balance.vacation_balance,
            max_carryover: balance.max_vacation_balance
          },
          sick: {
            total_accrued: balance.sick_total_accrued,
            used: balance.sick_used,
            balance: balance.sick_balance
          },
          personal: {
            total_accrued: balance.personal_total_accrued,
            used: balance.personal_used,
            balance: balance.personal_balance
          }
        },
        recent_accruals: recentAccruals,
        recent_leaves: leaveHistory,
        yearly_usage: yearlyUsage,
        last_accrual_date: balance.last_accrual_date,
        next_accrual_date: balance.next_accrual_date
      };
    } catch (error) {
      console.error('Error getting leave summary:', error);
      throw error;
    }
  }
  
  // Manual accrual for specific employee (admin function)
  static async manualAccrual(employeeId, leaveType, days, notes, adminId) {
    const transaction = await sequelize.transaction();
    
    try {
      const employee = await Employee.findByPk(employeeId);
      if (!employee) {
        throw new Error('Employee not found');
      }
      
      let balance = await LeaveBalance.findOne({
        where: { employee_id: employeeId },
        transaction
      });
      
      if (!balance) {
        balance = await LeaveBalance.create({
          employee_id: employeeId,
          year: new Date().getFullYear()
        }, { transaction });
      }
      
      let previousBalance, newBalance, field;
      
      switch (leaveType) {
        case 'vacation':
          previousBalance = parseFloat(balance.vacation_balance);
          newBalance = previousBalance + days;
          field = 'vacation_balance';
          await balance.update({
            vacation_total_accrued: parseFloat(balance.vacation_total_accrued) + days,
            vacation_balance: newBalance
          }, { transaction });
          break;
        case 'sick':
          previousBalance = parseFloat(balance.sick_balance);
          newBalance = previousBalance + days;
          field = 'sick_balance';
          await balance.update({
            sick_total_accrued: parseFloat(balance.sick_total_accrued) + days,
            sick_balance: newBalance
          }, { transaction });
          break;
        case 'personal':
          previousBalance = parseFloat(balance.personal_balance);
          newBalance = previousBalance + days;
          field = 'personal_balance';
          await balance.update({
            personal_total_accrued: parseFloat(balance.personal_total_accrued) + days,
            personal_balance: newBalance
          }, { transaction });
          break;
        default:
          throw new Error('Invalid leave type');
      }
      
      await LeaveAccrualLog.create({
        employee_id: employeeId,
        accrual_date: new Date(),
        leave_type: leaveType,
        days_accrued: days,
        previous_balance: previousBalance,
        new_balance: newBalance,
        accrual_month: new Date().getMonth() + 1,
        accrual_year: new Date().getFullYear(),
        notes: `Manual adjustment: ${notes}`,
        processed_by: adminId
      }, { transaction });
      
      await transaction.commit();
      
      return {
        success: true,
        employee: employee.full_name,
        leaveType,
        days,
        newBalance
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  
  // Year-end balance carryover
  static async processYearEndCarryover(year) {
    const transaction = await sequelize.transaction();
    
    try {
      const balances = await LeaveBalance.findAll({
        where: { year: year },
        transaction
      });
      
      let processedCount = 0;
      
      for (const balance of balances) {
        // Cap vacation balance at max allowed
        const cappedVacation = Math.min(
          parseFloat(balance.vacation_balance),
          balance.max_vacation_balance || 30
        );
        
        // Create new balance for next year
        await LeaveBalance.create({
          employee_id: balance.employee_id,
          year: year + 1,
          vacation_balance: cappedVacation,
          sick_balance: parseFloat(balance.sick_balance),
          personal_balance: parseFloat(balance.personal_balance),
          max_vacation_balance: balance.max_vacation_balance,
          accrual_rate_vacation: balance.accrual_rate_vacation,
          accrual_rate_sick: balance.accrual_rate_sick,
          accrual_rate_personal: balance.accrual_rate_personal,
          last_accrual_date: balance.last_accrual_date,
          next_accrual_date: balance.next_accrual_date
        }, { transaction });
        
        processedCount++;
      }
      
      await transaction.commit();
      
      console.log(`✅ Year-end carryover completed for ${processedCount} employees`);
      
      return {
        success: true,
        processedCount,
        year
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  
  // Check and run accrual if needed (for scheduler)
  static async checkAndRunAccrual() {
    const today = new Date();
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    // Run on the last day of each month
    if (today.getDate() === lastDayOfMonth.getDate()) {
      console.log('📅 Running scheduled monthly accrual...');
      return await this.processMonthlyAccrual(today);
    } else {
      console.log('⏰ Not accrual day yet. Next accrual on:', lastDayOfMonth.toISOString().split('T')[0]);
      return null;
    }
  }
}

module.exports = LeaveAccrualService;