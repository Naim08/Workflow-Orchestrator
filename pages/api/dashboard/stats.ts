// pages/api/dashboard/stats.ts
import { NextApiRequest, NextApiResponse } from 'next';
import supabase from '@/lib/supabase';


interface ActivityDay {
  date: string;
  executions: number;
  successes: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {

    
    // Get current date boundaries for "today"
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();
    
    // 1. Get count of active rules
    const { data: activeRules, error: rulesError } = await supabase
      .from('rules')
      .select('id')
      .eq('enabled', true);
    
    if (rulesError) throw rulesError;
    
    // 2. Get executions today - using logs table with appropriate filters
    const { data: executionsToday, error: executionsError } = await supabase
      .from('logs')
      .select('id, type')
      .gte('timestamp', todayStart)
      .lt('timestamp', todayEnd);
    
    if (executionsError) throw executionsError;
    
    // 3. Calculate success rate based on log types
    // Assuming "success" or "completed" in the type field indicates success
    // and "error", "failure", or "failed" indicates failure
    const successfulExecutions = executionsToday?.filter(log => {
      const typeValue = log.type?.toLowerCase() || '';
      return typeValue.includes('success') || typeValue.includes('completed');
    });
    
    const failedExecutions = executionsToday?.filter(log => {
      const typeValue = log.type?.toLowerCase() || '';
      return typeValue.includes('error') || typeValue.includes('failure') || typeValue.includes('failed');
    });
    
    // Calculate success rate
    let successRate = '0%';
    if (executionsToday && executionsToday.length > 0) {
      // Only count logs that are clearly successes or failures
      const totalRelevantLogs = (successfulExecutions?.length || 0) + (failedExecutions?.length || 0);
      
      if (totalRelevantLogs > 0) {
        const rate = (successfulExecutions?.length || 0) / totalRelevantLogs * 100;
        successRate = `${Math.round(rate)}%`;
      } else {
        successRate = 'N/A'; // No relevant logs to calculate rate
      }
    } else if (executionsToday && executionsToday.length === 0) {
      successRate = '100%'; // No executions means no failures
    }
    
    // 4. Get recent activity (last 7 days)
    const recentActivity: ActivityDay[] = [];
    
    // Get date 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6); // -6 to include today
    
    // Loop through each day and get data
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(sevenDaysAgo);
      currentDate.setDate(currentDate.getDate() + i);
      
      const dayStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()).toISOString();
      const dayEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1).toISOString();
      
      // Get all executions for this day
      const { data: dayExecutions, error: dayExecError } = await supabase
        .from('logs')
        .select('id, type')
        .gte('timestamp', dayStart)
        .lt('timestamp', dayEnd);
      
      if (dayExecError) throw dayExecError;
      
      // Count successful executions based on log type
      const successfulCount = dayExecutions?.filter(log => {
        const typeValue = log.type?.toLowerCase() || '';
        return typeValue.includes('success') || typeValue.includes('completed');
      }).length || 0;
      
      // Format date as MM/DD
      const formattedDate = `${currentDate.getMonth() + 1}/${currentDate.getDate()}`;
      
      recentActivity.push({
        date: formattedDate,
        executions: dayExecutions?.length || 0,
        successes: successfulCount
      });
    }
    
    // 5. Get dead letter queue statistics
    const { data: dlqItems, error: dlqError } = await supabase
      .from('dead_letter_queue')
      .select('id, status')
      .order('timestamp', { ascending: false })
      .limit(100);
    
    if (dlqError) throw dlqError;
    
    const dlqCount = dlqItems?.length || 0;
    const resolvedDlqCount = dlqItems?.filter(item => item.status === 'resolved' || item.status === 'processed').length || 0;
    const pendingDlqCount = dlqCount - resolvedDlqCount;
    
    // Return the stats
    return res.status(200).json({
      activeRules: activeRules?.length || 0,
      executionsToday: executionsToday?.length || 0,
      successRate,
      recentActivity,
      dlq: {
        total: dlqCount,
        resolved: resolvedDlqCount,
        pending: pendingDlqCount
      }
    });
    
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
}