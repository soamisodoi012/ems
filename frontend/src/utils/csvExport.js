import Papa from 'papaparse';

/**
 * Export data to CSV file
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Name of the file (without extension)
 * @param {Array} columns - Optional: specify which columns to include and their headers
 * @returns {Promise} - Resolves when download starts
 */
export const exportToCSV = (data, filename, columns = null) => {
  return new Promise((resolve, reject) => {
    try {
      if (!data || data.length === 0) {
        reject(new Error('No data to export'));
        return;
      }

      let exportData = data;

      // If columns are specified, map data to only those columns
      if (columns && columns.length > 0) {
        exportData = data.map(item => {
          const newItem = {};
          columns.forEach(col => {
            newItem[col.header] = item[col.field];
          });
          return newItem;
        });
      }

      // Convert to CSV
      const csv = Papa.unparse(exportData);
      
      // Create blob and download
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Export employees data to CSV
 * @param {Array} employees - Array of employee objects
 * @param {string} filename - Custom filename (optional)
 */
export const exportEmployeesToCSV = (employees, filename = 'employees') => {
  const exportData = employees.map(emp => ({
    'Employee Code': emp.employee_code || 'N/A',
    'Full Name': emp.full_name,
    'Email': emp.email,
    'Phone': emp.phone || 'N/A',
    'Position': emp.position,
    'Department': emp.department?.name || 'N/A',
    'Manager': emp.manager?.full_name || 'N/A',
    'Status': emp.status,
    'Salary': emp.salary ? `$${emp.salary.toLocaleString()}` : 'N/A',
    'Employment Date': emp.employment_date ? new Date(emp.employment_date).toLocaleDateString() : 'N/A',
    'Created Date': emp.created_at ? new Date(emp.created_at).toLocaleDateString() : 'N/A'
  }));

  return exportToCSV(exportData, filename);
};

/**
 * Export departments data to CSV
 * @param {Array} departments - Array of department objects
 * @param {string} filename - Custom filename (optional)
 */
export const exportDepartmentsToCSV = (departments, filename = 'departments') => {
  const exportData = departments.map(dept => ({
    'Department Name': dept.name,
    'Description': dept.description || 'N/A',
    'Manager': dept.manager?.full_name || 'Not assigned',
    'Total Employees': dept.employees?.length || 0,
    'Created Date': dept.created_at ? new Date(dept.created_at).toLocaleDateString() : 'N/A'
  }));

  return exportToCSV(exportData, filename);
};

/**
 * Export users data to CSV
 * @param {Array} users - Array of user objects
 * @param {string} filename - Custom filename (optional)
 */
export const exportUsersToCSV = (users, filename = 'users') => {
  const exportData = users.map(user => ({
    'Full Name': user.full_name,
    'Email': user.email,
    'Role': user.role,
    'Status': user.is_active ? 'Active' : 'Inactive',
    'Associated Employee': user.employee?.full_name || 'N/A',
    'Created Date': user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'
  }));

  return exportToCSV(exportData, filename);
};

/**
 * Export attendance data to CSV
 * @param {Array} attendance - Array of attendance objects
 * @param {string} filename - Custom filename (optional)
 */
export const exportAttendanceToCSV = (attendance, filename = 'attendance') => {
  const exportData = attendance.map(record => ({
    'Date': record.date,
    'Employee': record.employee?.full_name || 'N/A',
    'Check In': record.check_in ? new Date(record.check_in).toLocaleTimeString() : '-',
    'Check Out': record.check_out ? new Date(record.check_out).toLocaleTimeString() : '-',
    'Status': record.status,
    'Working Hours': record.working_hours ? `${record.working_hours} hrs` : '-',
    'Overtime': record.overtime ? `${record.overtime} hrs` : '-'
  }));

  return exportToCSV(exportData, filename);
};

/**
 * Export leaves data to CSV
 * @param {Array} leaves - Array of leave objects
 * @param {string} filename - Custom filename (optional)
 */
export const exportLeavesToCSV = (leaves, filename = 'leaves') => {
  const exportData = leaves.map(leave => ({
    'Employee': leave.employee?.full_name || 'N/A',
    'Leave Type': leave.leave_type,
    'Start Date': leave.start_date,
    'End Date': leave.end_date,
    'Total Days': leave.total_days,
    'Reason': leave.reason,
    'Status': leave.status,
    'Approved By': leave.approver?.full_name || 'N/A',
    'Created Date': leave.created_at ? new Date(leave.created_at).toLocaleDateString() : 'N/A'
  }));

  return exportToCSV(exportData, filename);
};