import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Layers,
  LayoutDashboard,
  TableProperties,
  Kanban,
  Activity,
  FileSpreadsheet,
  AlertOctagon,
  CheckSquare,
  ShieldCheck,
  History,
  FileCode2,
  Bell,
  Sun,
  Moon,
  Zap,
  Sparkles,
  Database,
  Palette,
  ChevronDown,
  Radio,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Target,
  Menu,
  X,
  ChevronRight,
  ExternalLink,
  SlidersHorizontal,
  LogOut
} from 'lucide-react';

interface HeaderProps {
  onOpenArchitecture: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenArchitecture }) => {
  const {
    currentUser,
    setCurrentUser,
    availableUsers,
    activeView,
    setActiveView,
    realTimeEvents,
    signalRConnected,
    markEventRead,
    clearAllEvents,
    exceptionRequests,
    themeMode,
    setThemeMode,
    logout
  } = useApp();

  const [showMobileNav, setShowMobileNav] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);

  const unreadEventsCount = realTimeEvents.filter(e => !e.read).length;
  const pendingExceptionsCount = exceptionRequests.filter(e => e.status === 'Pending').length;

  const handleNavSelect = (view: any) => {
    setActiveView(view);
    setShowMobileNav(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors shadow-xs">
        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 h-16">
          {/* Left: Mobile Menu Toggle & Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Mobile Hamburger Drawer Button */}
            <button
              onClick={() => setShowMobileNav(!showMobileNav)}
              className="xl:hidden p-2 -ml-1 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Toggle navigation menu"
            >
              {showMobileNav ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Brand Logo & Title */}
            <div
              onClick={() => setActiveView('tracker')}
              className="flex items-center gap-2.5 cursor-pointer select-none"
            >
              <div className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-blue-600 text-white shadow-xs">
                <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
                  MissionPulse
                </span>
                <span className="hidden md:inline-block ml-2 text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                  Enterprise v2.0
                </span>
              </div>
            </div>
          </div>

          {/* Center (Desktop): Primary Nav Links with Clear Groupings */}
          <nav className="hidden xl:flex items-center gap-1 text-xs font-medium">
            <button
              onClick={() => setActiveView('tracker')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeView === 'tracker'
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <TableProperties className="w-3.5 h-3.5" />
              <span>Activity Tracker</span>
            </button>

            <button
              onClick={() => setActiveView('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeView === 'dashboard'
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Executive Dashboard</span>
            </button>

            <button
              onClick={() => setActiveView('board')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeView === 'board'
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Project Board</span>
            </button>

            <button
              onClick={() => setActiveView('missions')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeView === 'missions' || activeView === 'mission_details'
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <Target className="w-3.5 h-3.5 text-emerald-600" />
              <span>Missions Catalog</span>
            </button>

            <button
              onClick={() => setActiveView('activity_dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeView === 'activity_dashboard' || activeView === 'my_updates' || activeView === 'team_updates'
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Daily Hub</span>
            </button>

            <button
              onClick={() => setActiveView('actions')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeView === 'actions'
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Next Actions</span>
            </button>

            <button
              onClick={() => setActiveView('risks')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeView === 'risks'
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <AlertOctagon className="w-3.5 h-3.5 text-rose-500" />
              <span>Risks & Blockers</span>
            </button>

            <button
              onClick={() => setActiveView('reports')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeView === 'reports'
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Reports</span>
            </button>

            <button
              onClick={() => setActiveView('audit')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeView === 'audit'
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <History className="w-3.5 h-3.5 text-indigo-600" />
              <span>Audit</span>
            </button>

            <button
              onClick={() => setActiveView('master_data')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeView === 'master_data'
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
              title="Master Data Admin (Users, Roles, Role Assignments, Projects, Missions, Departments)"
            >
              <Database className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>Master Data</span>
            </button>
          </nav>

          {/* Right: Actions, Architecture, SignalR, Persona & Theme */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Architecture Blueprint Button (Desktop & Tablet) */}
            <button
              onClick={onOpenArchitecture}
              className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-md border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
              title="View Architecture, ERD, and Permission Matrix"
            >
              <FileCode2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Architecture</span>
            </button>

            {/* Real-time SignalR Status Indicator */}
            <div
              className="hidden sm:flex items-center gap-1.5 px-2 py-1 text-xs font-mono rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50"
              title="SignalR connection active: real-time updates enabled"
            >
              <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
              <span className="hidden md:inline">SignalR Live</span>
            </div>

            {/* Real-Time Notifications Center */}
            <div className="relative">
              <button
                onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
                className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Real-Time Event Stream"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadEventsCount > 0 && (
                  <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-blue-600 rounded-full animate-bounce">
                    {unreadEventsCount}
                  </span>
                )}
              </button>

              {showNotificationDropdown && (
                <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl p-3 z-50">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                      Live Event Stream ({realTimeEvents.length})
                    </span>
                    <button
                      onClick={clearAllEvents}
                      className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 py-1">
                    {realTimeEvents.length === 0 ? (
                      <div className="py-4 text-center text-xs text-slate-400">No events yet</div>
                    ) : (
                      realTimeEvents.map(evt => (
                        <div
                          key={evt.id}
                          onClick={() => markEventRead(evt.id)}
                          className={`p-2 text-xs rounded hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer ${
                            !evt.read ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between text-slate-400 text-[10px]">
                            <span>{evt.author}</span>
                            <span className="font-mono">{evt.timestamp}</span>
                          </div>
                          <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{evt.title}</p>
                          <p className="text-slate-500 dark:text-slate-400 text-[11px] truncate">{evt.description}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Theme Selector: Light vs Dark vs Dark (Fluorescent) */}
            <div className="relative">
              <button
                onClick={() => setShowThemeDropdown(!showThemeDropdown)}
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs transition-colors"
                title="Select UI Theme: Light, Dark, or Dark (Fluorescent)"
                aria-label="Theme selector"
              >
                {themeMode === 'light' && <Sun className="w-3.5 h-3.5 text-amber-500" />}
                {themeMode === 'dark' && <Moon className="w-3.5 h-3.5 text-indigo-400" />}
                {themeMode === 'fluorescent' && <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />}
                <span className="capitalize font-medium text-[11px] hidden md:inline">
                  {themeMode === 'fluorescent' ? 'Fluorescent' : themeMode}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showThemeDropdown && (
                <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl p-1.5 z-50 text-xs">
                  <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Select UI Theme
                  </div>

                  {/* Option 1: Light */}
                  <button
                    onClick={() => {
                      setThemeMode('light');
                      setShowThemeDropdown(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-md transition-colors ${
                      themeMode === 'light'
                        ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 font-semibold'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Sun className="w-4 h-4 text-amber-500" />
                      <span>Light Mode</span>
                    </div>
                    {themeMode === 'light' && <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />}
                  </button>

                  {/* Option 2: Dark */}
                  <button
                    onClick={() => {
                      setThemeMode('dark');
                      setShowThemeDropdown(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-md transition-colors ${
                      themeMode === 'dark'
                        ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-semibold'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Moon className="w-4 h-4 text-indigo-400" />
                      <span>Dark (Classic)</span>
                    </div>
                    {themeMode === 'dark' && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />}
                  </button>

                  {/* Option 3: Dark Fluorescent */}
                  <button
                    onClick={() => {
                      setThemeMode('fluorescent');
                      setShowThemeDropdown(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-md transition-colors ${
                      themeMode === 'fluorescent'
                        ? 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-300 font-semibold border border-cyan-400/30'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-cyan-400 animate-pulse" />
                      <div className="text-left">
                        <div>Dark (Fluorescent)</div>
                        <div className="text-[10px] text-cyan-500 font-mono">Cyber neon glow</div>
                      </div>
                    </div>
                    {themeMode === 'fluorescent' && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                  </button>
                </div>
              )}
            </div>

            {/* Persona / RBAC Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 pl-1.5 sm:pl-2 pr-2 sm:pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                title="Switch User Persona & Role"
              >
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs uppercase overflow-hidden shrink-0">
                  {currentUser.name.slice(0, 2)}
                </div>
                <div className="hidden sm:block text-left text-xs leading-tight">
                  <div className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[120px]">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 capitalize flex items-center gap-1">
                    <UserCheck className="w-3 h-3 text-blue-500 shrink-0" />
                    <span className="truncate">{currentUser.role}</span>
                  </div>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl p-2 z-50">
                  <div className="px-2 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Switch Active Persona / Role
                  </div>
                  <div className="space-y-1">
                    {availableUsers.map(u => (
                      <button
                        key={u.userId}
                        onClick={() => {
                          setCurrentUser(u);
                          setShowUserDropdown(false);
                        }}
                        className={`w-full flex items-start gap-2.5 p-2 rounded-md text-left text-xs transition-colors ${
                          currentUser.userId === u.userId
                            ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 flex items-center justify-center font-bold text-[10px] shrink-0">
                          {u.name.slice(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold truncate">{u.name}</div>
                          <div className="text-[10px] text-slate-500 truncate">{u.jobTitle}</div>
                          <span className="inline-block mt-0.5 text-[9px] font-mono uppercase px-1 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            Role: {u.role}
                          </span>
                        </div>
                        {currentUser.userId === u.userId && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-500 px-2">
                    Simulate different roles to verify permissions, daily updates, or admin controls.
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 p-2 rounded-md text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out / Lock Workspace</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Slide-Over Drawer */}
      {showMobileNav && (
        <div className="fixed inset-0 z-50 xl:hidden">
          {/* Backdrop */}
          <div
            onClick={() => setShowMobileNav(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer Container */}
          <div className="fixed inset-y-0 left-0 w-full max-w-xs sm:max-w-sm bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col z-50">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white leading-tight">MissionPulse</div>
                  <div className="text-[10px] text-slate-500 font-mono">Enterprise v2.0</div>
                </div>
              </div>
              <button
                onClick={() => setShowMobileNav(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Persona Badge inside mobile drawer */}
            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {currentUser.name.slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">{currentUser.name}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">{currentUser.role}</div>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowMobileNav(false);
                  setShowUserDropdown(true);
                }}
                className="text-[11px] text-blue-600 dark:text-blue-400 font-medium hover:underline shrink-0"
              >
                Switch
              </button>
            </div>

            {/* Nav Links Grouped for Clear Selection */}
            <div className="flex-1 overflow-y-auto p-3 space-y-4">
              {/* Group 1: Core Execution */}
              <div>
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Execution & Tracking
                </div>
                <div className="space-y-1 mt-1">
                  <button
                    onClick={() => handleNavSelect('tracker')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                      activeView === 'tracker'
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <TableProperties className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <div className="text-left">
                        <div>Activity Tracker</div>
                        <div className="text-[10px] text-slate-400">Excel-style 9-column live grid</div>
                      </div>
                    </div>
                    {activeView === 'tracker' && <ChevronRight className="w-4 h-4 text-blue-600" />}
                  </button>

                  <button
                    onClick={() => handleNavSelect('missions')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                      activeView === 'missions' || activeView === 'mission_details'
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <div className="text-left">
                        <div>Missions Catalog</div>
                        <div className="text-[10px] text-slate-400">Mission lifecycle & progress</div>
                      </div>
                    </div>
                    {(activeView === 'missions' || activeView === 'mission_details') && (
                      <ChevronRight className="w-4 h-4 text-blue-600" />
                    )}
                  </button>

                  <button
                    onClick={() => handleNavSelect('board')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                      activeView === 'board'
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Kanban className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <div className="text-left">
                        <div>Project Board</div>
                        <div className="text-[10px] text-slate-400">Interactive Kanban workflow</div>
                      </div>
                    </div>
                    {activeView === 'board' && <ChevronRight className="w-4 h-4 text-blue-600" />}
                  </button>

                  <button
                    onClick={() => handleNavSelect('activity_dashboard')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                      activeView === 'activity_dashboard' || activeView === 'my_updates' || activeView === 'team_updates'
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <div className="text-left">
                        <div>Daily Hub</div>
                        <div className="text-[10px] text-slate-400">Daily submissions & logs</div>
                      </div>
                    </div>
                    {(activeView === 'activity_dashboard' || activeView === 'my_updates' || activeView === 'team_updates') && (
                      <ChevronRight className="w-4 h-4 text-blue-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Group 2: Intelligence & Governance */}
              <div>
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Insights & Risk Management
                </div>
                <div className="space-y-1 mt-1">
                  <button
                    onClick={() => handleNavSelect('dashboard')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                      activeView === 'dashboard'
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <LayoutDashboard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <div className="text-left">
                        <div>Executive Dashboard</div>
                        <div className="text-[10px] text-slate-400">Portfolio health & KPIs</div>
                      </div>
                    </div>
                    {activeView === 'dashboard' && <ChevronRight className="w-4 h-4 text-blue-600" />}
                  </button>

                  <button
                    onClick={() => handleNavSelect('actions')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                      activeView === 'actions'
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <CheckSquare className="w-4 h-4 text-indigo-500" />
                      <div className="text-left">
                        <div>Next Actions</div>
                        <div className="text-[10px] text-slate-400">Planned follow-ups & due dates</div>
                      </div>
                    </div>
                    {activeView === 'actions' && <ChevronRight className="w-4 h-4 text-blue-600" />}
                  </button>

                  <button
                    onClick={() => handleNavSelect('risks')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                      activeView === 'risks'
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <AlertOctagon className="w-4 h-4 text-rose-500" />
                      <div className="text-left">
                        <div>Risks & Blockers</div>
                        <div className="text-[10px] text-slate-400">Critical impediments register</div>
                      </div>
                    </div>
                    {activeView === 'risks' && <ChevronRight className="w-4 h-4 text-blue-600" />}
                  </button>

                  <button
                    onClick={() => handleNavSelect('reports')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                      activeView === 'reports'
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                      <div className="text-left">
                        <div>Reports</div>
                        <div className="text-[10px] text-slate-400">Exportable executive reports</div>
                      </div>
                    </div>
                    {activeView === 'reports' && <ChevronRight className="w-4 h-4 text-blue-600" />}
                  </button>

                  <button
                    onClick={() => handleNavSelect('audit')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                      activeView === 'audit'
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <History className="w-4 h-4 text-indigo-600" />
                      <div className="text-left">
                        <div>Audit Trail</div>
                        <div className="text-[10px] text-slate-400">Immutable change log</div>
                      </div>
                    </div>
                    {activeView === 'audit' && <ChevronRight className="w-4 h-4 text-blue-600" />}
                  </button>

                  <button
                    onClick={() => handleNavSelect('master_data')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                      activeView === 'master_data'
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Database className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                      <div className="text-left">
                        <div>Master Data Admin</div>
                        <div className="text-[10px] text-slate-400">Users, Roles, Projects, Missions</div>
                      </div>
                    </div>
                    {activeView === 'master_data' && <ChevronRight className="w-4 h-4 text-blue-600" />}
                  </button>
                </div>
              </div>

              {/* Architecture Blueprint & Sign Out inside drawer */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1">
                <button
                  onClick={() => {
                    setShowMobileNav(false);
                    onOpenArchitecture();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <FileCode2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Architecture, ERD & Permissions</span>
                </button>

                <button
                  onClick={() => {
                    setShowMobileNav(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
