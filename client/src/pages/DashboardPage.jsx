import { ListTodo, Clock, CheckCircle2, AlertTriangle, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import PageWrapper from '../components/layout/PageWrapper';
import StatCard from '../components/shared/StatCard';
import StatusBadge from '../components/shared/StatusBadge';
import Avatar from '../components/ui/Avatar';
import Card, { CardHeader, CardBody } from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';
import { useDashboardStats, useDashboardCharts, useOverdueTasks, useRecentActivity } from '../hooks/useDashboard';
import { formatDate, formatRelativeTime, isOverdue } from '../utils/date';

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: charts, isLoading: chartsLoading } = useDashboardCharts();
  const { data: overdueTasks, isLoading: overdueLoading } = useOverdueTasks();
  const { data: activities, isLoading: activityLoading } = useRecentActivity();

  return (
    <PageWrapper>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statsLoading ? (
          [...Array(4)].map((_, i) => <Skeleton key={i} className="h-[120px] rounded-xl" />)
        ) : (
          <>
            <StatCard title="Total Tasks" value={stats?.totalTasks ?? 0} icon={ListTodo} color="primary" />
            <StatCard title="In Progress" value={stats?.inProgress ?? 0} icon={Clock} color="warning" />
            <StatCard title="Completed" value={stats?.completed ?? 0} icon={CheckCircle2} color="success" />
            <StatCard title="Overdue" value={stats?.overdue ?? 0} icon={AlertTriangle} color="danger" />
          </>
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        {/* Bar Chart — Tasks by Project */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <h3 className="text-sm font-semibold text-slate-200">Tasks by Project</h3>
          </CardHeader>
          <CardBody>
            {chartsLoading ? (
              <Skeleton className="h-[280px]" />
            ) : charts?.tasksByProject?.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={charts.tasksByProject} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    axisLine={{ stroke: '#1e293b' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    axisLine={{ stroke: '#1e293b' }}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: '#f1f5f9',
                    }}
                  />
                  <Bar dataKey="done" name="Done" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="inProgress" name="In Progress" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="todo" name="To Do" fill="#64748b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-sm text-slate-500">
                No project data available
              </div>
            )}
          </CardBody>
        </Card>

        {/* Donut Chart — Tasks by Status */}
        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold text-slate-200">Tasks by Status</h3>
          </CardHeader>
          <CardBody>
            {chartsLoading ? (
              <Skeleton className="h-[280px]" />
            ) : charts?.tasksByStatus?.some((s) => s.value > 0) ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={charts.tasksByStatus}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {charts.tasksByStatus.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: '#f1f5f9',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-sm text-slate-500">
                No tasks yet
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Overdue Tasks */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-200">Overdue Tasks</h3>
              <span className="text-xs text-rose-400 font-medium">
                {overdueTasks?.length || 0} overdue
              </span>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            {overdueLoading ? (
              <div className="p-5 space-y-3">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12" />)}
              </div>
            ) : overdueTasks?.length > 0 ? (
              <div className="divide-y divide-slate-800/60">
                {overdueTasks.map((task) => (
                  <div key={task.id} className="px-5 py-3 flex items-center gap-3 hover:bg-slate-800/30 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate">{task.title}</p>
                      <p className="text-xs text-slate-500">{task.project?.name}</p>
                    </div>
                    {task.assignedTo && (
                      <Avatar name={task.assignedTo.name} size="xs" />
                    )}
                    <div className="flex items-center gap-1 text-xs text-rose-400">
                      <Calendar className="w-3 h-3" />
                      {formatDate(task.dueDate)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-sm text-slate-500">
                🎉 No overdue tasks! Great work.
              </div>
            )}
          </CardBody>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold text-slate-200">Recent Activity</h3>
          </CardHeader>
          <CardBody className="p-0">
            {activityLoading ? (
              <div className="p-5 space-y-3">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12" />)}
              </div>
            ) : activities?.length > 0 ? (
              <div className="divide-y divide-slate-800/60">
                {activities.map((activity) => (
                  <div key={activity.id} className="px-5 py-3 flex items-center gap-3 hover:bg-slate-800/30 transition-colors">
                    <div className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-200 truncate">
                        <span className="font-medium">{activity.title}</span>
                      </p>
                      <p className="text-xs text-slate-500">
                        {activity.project?.name} · {formatRelativeTime(activity.updatedAt)}
                      </p>
                    </div>
                    <StatusBadge status={activity.status} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-sm text-slate-500">
                No recent activity
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </PageWrapper>
  );
}
