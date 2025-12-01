// src/utils/dateUtils.js  
  
/**  
 * 格式化日期为 "YYYY-MM-DD HH:mm:ss" 格式  
 * @param {Date} date - 要格式化的日期对象  
 * @returns {string} - 格式化后的日期字符串  
 */  
export function formatDate(date) {  
  let year = date.getFullYear();  
  let month = String(date.getMonth() + 1).padStart(2, '0');  
  let day = String(date.getDate()).padStart(2, '0');  
  let hour = String(date.getHours()).padStart(2, '0');  
  let minute = String(date.getMinutes()).padStart(2, '0');  
  let second = String(date.getSeconds()).padStart(2, '0');  
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;  
}  
/**  
 * 格式化日期为 "YYYY-MM-DD HH:mm:ss" 格式  
 * @param {Date} date - 要格式化的日期对象  
 * @returns {string} - 格式化后的日期字符串  
 */  
export function formatDateMonthDayHourMinute(date) {  
  let year = date.getFullYear();  
  let month = String(date.getMonth() + 1).padStart(2, '0');  
  let day = String(date.getDate()).padStart(2, '0');  
  let hour = String(date.getHours()).padStart(2, '0');  
  let minute = String(date.getMinutes()).padStart(2, '0');  
  let second = String(date.getSeconds()).padStart(2, '0');  
  return `${month}月${day}日 ${hour}:${minute}`;
}
export function formatDatesDay(date) {
  let year = date.getFullYear();  
  let month = String(date.getMonth() + 1).padStart(2, '0');  
  let day = String(date.getDate()).padStart(2, '0');  
  let hour = String(date.getHours()).padStart(2, '0');  
  let minute = String(date.getMinutes()).padStart(2, '0');  
  let second = String(date.getSeconds()).padStart(2, '0');  
  return `${year}-${month}-${day}`;
}
export function formatDates(date) {  
  let year = date.getFullYear();  
  let month = String(date.getMonth() + 1).padStart(2, '0');  
  let day = String(date.getDate()).padStart(2, '0');  
  let hour = String(date.getHours()).padStart(2, '0');  
  let minute = String(date.getMinutes()).padStart(2, '0');  
  let second = String(date.getSeconds()).padStart(2, '0');  
  return `${hour}:${minute}:${second}`;
}
export function formatDatesMinute(date) { 
  let year = date.getFullYear();  
  let month = String(date.getMonth() + 1).padStart(2, '0');  
  let day = String(date.getDate()).padStart(2, '0');  
  let hour = String(date.getHours()).padStart(2, '0');  
  let minute = String(date.getMinutes()).padStart(2, '0');  
  let second = String(date.getSeconds()).padStart(2, '0');
  return `${hour}:${minute}`;
}
export function formatDatesMonth(date) {  
  let year = date.getFullYear();  
  let month = String(date.getMonth() + 1).padStart(2, '0');  
  let day = String(date.getDate()).padStart(2, '0');  
  let hour = String(date.getHours()).padStart(2, '0');  
  let minute = String(date.getMinutes()).padStart(2, '0');  
  let second = String(date.getSeconds()).padStart(2, '0');  
  return `${year}-${month}`;
}
export function getDayStartAndEndTimestamps(inputDate) {  
    // 将输入日期（可以是 Date 对象、时间戳或日期字符串）转换为 Date 对象
    let date = new Date(inputDate);  
  
    // 获取当天的开始时间（00:00:00）  
    let startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);  
  
    // 获取当天的结束时间（23:59:59.999）
    let endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1, 0, 0, 0, -1);  
  
    // 返回时间戳（毫秒）
    return {  
        startTimestamp: startOfDay.getTime(),  
        endTimestamp: endOfDay.getTime()  
    };  
}