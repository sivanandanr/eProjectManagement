/**
 * Enterprise Project & Task Management Platform - Main Application
 * Master Specification v2.0 - Mission-Based Architecture
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { SubHeader } from './components/layout/SubHeader';
import { MissionActivityTracker } from './components/tracker/MissionActivityTracker';
import { ExecutiveDashboard } from './components/dashboard/ExecutiveDashboard';
import { ProjectBoard } from './components/board/ProjectBoard';
import { DailyActivityDashboard } from './components/dashboard/DailyActivityDashboard';
import { ReportsView } from './components/reports/ReportsView';
import { RiskBlockerRegister } from './components/risks/RiskBlockerRegister';
import { DailyUpdateModal } from './components/dailyUpdate/DailyUpdateModal';
import { ExcelImportModal } from './components/tracker/ExcelImportModal';
import { TaskDetailDrawer } from './components/tasks/TaskDetailDrawer';
import { ArchitectureModal } from './components/architecture/ArchitectureModal';
import { ExceptionApprovalModal } from './components/validation/ExceptionApprovalModal';
import { NewTaskModal } from './components/tasks/NewTaskModal';
import { NewMissionModal } from './components/missions/NewMissionModal';
import { MissionListingView } from './components/missions/MissionListingView';
import { MissionDetailsView } from './components/missions/MissionDetailsView';
import { MyDailyUpdatesView } from './components/dailyUpdate/MyDailyUpdatesView';
import { TeamDailyUpdatesView } from './components/dailyUpdate/TeamDailyUpdatesView';
import { NextActionRegister } from './components/actions/NextActionRegister';
import { ProgressHistoryView } from './components/audit/ProgressHistoryView';
import { MasterDataAdminView } from './components/admin/MasterDataAdminView';
import { AdminFirstTimeSetup } from './components/auth/AdminFirstTimeSetup';
import { LoginView } from './components/auth/LoginView';
import { OtpDeliveryBanner } from './components/common/OtpDeliveryBanner';

import {
  TableProperties,
  LayoutDashboard,
  Target,
  Activity,
  Kanban,
  Database
} from 'lucide-react';

const AppContent: React.FC = () => {
  const {
    activeView,
    setActiveView,
    selectedTaskIdForDrawer,
    setSelectedTaskIdForDrawer
  } = useApp();

  // Modals state
  const [isDailyUpdateModalOpen, setIsDailyUpdateModalOpen] = useState(false);
  const [dailyUpdatePreselectedTaskId, setDailyUpdatePreselectedTaskId] = useState<string | undefined>(undefined);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isArchitectureModalOpen, setIsArchitectureModalOpen] = useState(false);
  const [isExceptionModalOpen, setIsExceptionModalOpen] = useState(false);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [isNewMissionModalOpen, setIsNewMissionModalOpen] = useState(false);

  const handleOpenDailyUpdate = (taskId?: string) => {
    setDailyUpdatePreselectedTaskId(taskId);
    setIsDailyUpdateModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Primary Top Bar (Zone 1, 2, 3 Contract) */}
      <Header onOpenArchitecture={() => setIsArchitectureModalOpen(true)} />

      {/* Subheader: Project, Mission Selectors, Action Triggers */}
      <SubHeader
        onOpenDailyUpdateModal={() => handleOpenDailyUpdate()}
        onOpenImportModal={() => setIsImportModalOpen(true)}
        onOpenNewTaskModal={() => setIsNewTaskModalOpen(true)}
        onOpenNewMissionModal={() => setIsNewMissionModalOpen(true)}
        onOpenExceptionModal={() => setIsExceptionModalOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden pb-16 xl:pb-0">
        {activeView === 'tracker' && (
          <MissionActivityTracker
            onOpenTaskDrawer={taskId => setSelectedTaskIdForDrawer(taskId)}
            onOpenDailyUpdateModal={taskId => handleOpenDailyUpdate(taskId)}
            onOpenImportModal={() => setIsImportModalOpen(true)}
            onOpenExceptionModal={() => setIsExceptionModalOpen(true)}
          />
        )}

        {activeView === 'dashboard' && (
          <ExecutiveDashboard
            onOpenTaskDrawer={taskId => setSelectedTaskIdForDrawer(taskId)}
            onOpenDailyUpdateModal={() => handleOpenDailyUpdate()}
            onOpenExceptionModal={() => setIsExceptionModalOpen(true)}
          />
        )}

        {activeView === 'board' && (
          <ProjectBoard
            onOpenTaskDrawer={taskId => setSelectedTaskIdForDrawer(taskId)}
            onOpenNewTaskModal={() => setIsNewTaskModalOpen(true)}
          />
        )}

        {activeView === 'activity_dashboard' && (
          <DailyActivityDashboard
            onOpenTaskDrawer={taskId => setSelectedTaskIdForDrawer(taskId)}
            onOpenDailyUpdateModal={taskId => handleOpenDailyUpdate(taskId)}
          />
        )}

        {activeView === 'missions' && (
          <MissionListingView onOpenNewMissionModal={() => setIsNewMissionModalOpen(true)} />
        )}

        {activeView === 'mission_details' && (
          <MissionDetailsView
            onBackToMissions={() => setActiveView('missions')}
            onOpenTaskDrawer={taskId => setSelectedTaskIdForDrawer(taskId)}
            onOpenDailyUpdateModal={taskId => handleOpenDailyUpdate(taskId)}
            onOpenNewTaskModal={() => setIsNewTaskModalOpen(true)}
          />
        )}

        {activeView === 'my_updates' && (
          <MyDailyUpdatesView
            onOpenDailyUpdateModal={taskId => handleOpenDailyUpdate(taskId)}
            onOpenTaskDrawer={taskId => setSelectedTaskIdForDrawer(taskId)}
          />
        )}

        {activeView === 'team_updates' && (
          <TeamDailyUpdatesView
            onOpenDailyUpdateModal={taskId => handleOpenDailyUpdate(taskId)}
            onOpenTaskDrawer={taskId => setSelectedTaskIdForDrawer(taskId)}
          />
        )}

        {activeView === 'actions' && (
          <NextActionRegister onOpenTaskDrawer={taskId => setSelectedTaskIdForDrawer(taskId)} />
        )}

        {activeView === 'reports' && <ReportsView />}

        {activeView === 'risks' && <RiskBlockerRegister />}

        {activeView === 'audit' && <ProgressHistoryView />}
        {activeView === 'master_data' && <MasterDataAdminView />}
      </main>

      {/* Mobile & Tablet Quick Bottom Navigation Bar */}
      <nav
        aria-label="Mobile navigation"
        className="xl:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 flex items-center justify-around px-2 py-1.5 shadow-lg"
      >
        <button
          onClick={() => setActiveView('tracker')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors ${
            activeView === 'tracker'
              ? 'text-blue-600 dark:text-blue-400 font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <TableProperties className="w-5 h-5 mb-0.5" />
          <span>Tracker</span>
        </button>

        <button
          onClick={() => setActiveView('dashboard')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors ${
            activeView === 'dashboard'
              ? 'text-blue-600 dark:text-blue-400 font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => setActiveView('missions')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors ${
            activeView === 'missions' || activeView === 'mission_details'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Target className="w-5 h-5 mb-0.5" />
          <span>Missions</span>
        </button>

        <button
          onClick={() => setActiveView('activity_dashboard')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors ${
            activeView === 'activity_dashboard' || activeView === 'my_updates' || activeView === 'team_updates'
              ? 'text-blue-600 dark:text-blue-400 font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Activity className="w-5 h-5 mb-0.5" />
          <span>Daily Hub</span>
        </button>

        <button
          onClick={() => setActiveView('board')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors ${
            activeView === 'board'
              ? 'text-blue-600 dark:text-blue-400 font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Kanban className="w-5 h-5 mb-0.5" />
          <span>Board</span>
        </button>
      </nav>

      {/* Side Drawer for Task Details */}
      <TaskDetailDrawer
        taskId={selectedTaskIdForDrawer}
        onClose={() => setSelectedTaskIdForDrawer(null)}
        onOpenDailyUpdateModal={taskId => handleOpenDailyUpdate(taskId)}
        onOpenExceptionModal={() => setIsExceptionModalOpen(true)}
      />

      {/* Modals */}
      <DailyUpdateModal
        isOpen={isDailyUpdateModalOpen}
        onClose={() => setIsDailyUpdateModalOpen(false)}
        preselectedTaskId={dailyUpdatePreselectedTaskId}
      />

      <ExcelImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />

      <ArchitectureModal
        isOpen={isArchitectureModalOpen}
        onClose={() => setIsArchitectureModalOpen(false)}
      />

      <ExceptionApprovalModal
        isOpen={isExceptionModalOpen}
        onClose={() => setIsExceptionModalOpen(false)}
      />

      <NewTaskModal
        isOpen={isNewTaskModalOpen}
        onClose={() => setIsNewTaskModalOpen(false)}
      />

      <NewMissionModal
        isOpen={isNewMissionModalOpen}
        onClose={() => setIsNewMissionModalOpen(false)}
      />
    </div>
  );
};

const RootRouter: React.FC = () => {
  const { isInitialSetupCompleted, isAuthenticated } = useApp();

  if (!isInitialSetupCompleted) {
    return (
      <>
        <OtpDeliveryBanner />
        <AdminFirstTimeSetup />
      </>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <OtpDeliveryBanner />
        <LoginView />
      </>
    );
  }

  return (
    <>
      <OtpDeliveryBanner />
      <AppContent />
    </>
  );
};

export default function App() {
  return (
    <AppProvider>
      <RootRouter />
    </AppProvider>
  );
}
