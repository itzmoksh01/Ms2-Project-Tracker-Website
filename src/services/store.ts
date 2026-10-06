/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Project, DailyProgress, ActivityLog, ProjectStage, ProjectHealth, AppSettings, InAppNotification, AdminPrivateNotesData } from '../types';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where 
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

// Today's Date Constant for system consistency (matching user metadata)
export const TODAY_DATE_STR = '2026-06-17';

// -------------------------------------------------------------
// METRICS UTILITIES
// -------------------------------------------------------------
export function computeProjectMetrics(startDateStr: string, deadlineStr: string, currentStage: ProjectStage): {
  expectedPercent: number;
  actualPercent: number;
  health: ProjectHealth;
} {
  const start = new Date(startDateStr).getTime();
  const deadline = new Date(deadlineStr).getTime();
  const today = new Date(TODAY_DATE_STR).getTime();

  let expectedPercent = 0;
  if (deadline > start) {
    const totalDuration = deadline - start;
    const elapsed = today - start;
    expectedPercent = Math.round((elapsed / totalDuration) * 100);
    if (expectedPercent < 0) expectedPercent = 0;
    if (expectedPercent > 100) expectedPercent = 100;
  } else {
    expectedPercent = 100;
  }

  let actualPercent = 20;
  switch (currentStage) {
    case 'Early Stage':
      actualPercent = 20;
      break;
    case 'In Progress':
      actualPercent = 55;
      break;
    case 'Final Stage':
      actualPercent = 85;
      break;
    case 'Complete':
      actualPercent = 100;
      break;
  }

  // Health selection logic:
  // Compare current progress with expected progress
  const diff = actualPercent - expectedPercent; // e.g. visual difference
  let health: ProjectHealth = 'On Track';

  if (actualPercent === 100) {
    health = 'Excellent';
  } else if (diff >= 10) {
    health = 'Excellent';
  } else if (diff >= -10) {
    health = 'On Track';
  } else if (diff >= -20) {
    health = 'Slight Delay';
  } else if (diff >= -35) {
    health = 'High Risk';
  } else {
    health = 'Critical';
  }

  return {
    expectedPercent,
    actualPercent,
    health,
  };
}

// -------------------------------------------------------------
// DEFAULT IN-MEMORY/LOCAL SEED DATA (For immediate out-of-the-box operation)
// -------------------------------------------------------------
const DEFAULT_USERS: User[] = [
  {
    uid: 'uid-ratan-admin',
    fullName: 'Ratan',
    email: 'ratan@ms2.co.in',
    username: 'Ratan',
    employeeId: 'MS2-786',
    role: 'admin',
    status: 'active',
    designation: 'Studio Director & Administrator',
    department: 'Executive',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    uid: 'uid-madhur-emp',
    fullName: 'Madhur',
    email: 'madhur@ms2.co.in',
    username: 'Madhur',
    employeeId: 'MS2-EMP-465',
    role: 'employee',
    status: 'active',
    designation: 'Senior Video Editor',
    department: 'Post-Production',
    createdAt: '2026-02-15T00:00:00Z',
    updatedAt: '2026-02-15T00:00:00Z',
  },
  {
    uid: 'uid-abhishek-emp',
    fullName: 'Abhishek',
    email: 'abhishek@ms2.co.in',
    username: 'Abhishek',
    employeeId: 'MS2-EMP-007',
    role: 'employee',
    status: 'active',
    designation: 'Art Director & Designer',
    department: 'Creative Design',
    createdAt: '2026-03-01T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z',
  },
  {
    uid: 'uid-krishna-emp',
    fullName: 'Krishna',
    email: 'krishna@ms2.co.in',
    username: 'Krishna',
    employeeId: 'MS2-EMP-420',
    role: 'employee',
    status: 'active',
    designation: 'Director of Production',
    department: 'Filming & Audio',
    createdAt: '2026-04-10T00:00:00Z',
    updatedAt: '2026-04-10T00:00:00Z',
  }
];

// Pre-define Project seeds
const DEFAULT_PROJECTS: Project[] = [
  {
    projectId: 'proj-brand-film',
    projectCode: 'MS2-PRJ-001',
    projectName: 'Brand Film Edit',
    clientName: 'Tata Premium Cine',
    description: 'High-end color grading, edit rhythm polishing, sound mastering, and theatrical mix of the flagship 3-minute corporate brand film.',
    startDate: '2026-06-10',
    deadline: '2026-06-30',
    priority: 'High',
    status: 'Active',
    currentStage: 'In Progress',
    currentCompletionPercent: 55,
    expectedProgressPercent: 35,
    healthStatus: 'Excellent', // 55% actual is ahead of 35% expected
    assignedEmployeeIds: ['uid-madhur-emp', 'uid-abhishek-emp'],
    createdBy: 'uid-ratan-admin',
    createdAt: '2026-06-10T10:00:00Z',
    updatedAt: '2026-06-10T10:00:00Z',
  },
  {
    projectId: 'proj-social-campaign',
    projectCode: 'MS2-PRJ-002',
    projectName: 'Social Media Campaign',
    clientName: 'Netflix India Promotions',
    description: 'Interactive graphic design templates and sound effects edit for the season trailer promo series.',
    startDate: '2026-06-12',
    deadline: '2026-06-25',
    priority: 'Critical',
    status: 'Active',
    currentStage: 'Early Stage',
    currentCompletionPercent: 20,
    expectedProgressPercent: 38,
    healthStatus: 'Slight Delay', // 20% vs 38% expected (diff -18)
    assignedEmployeeIds: ['uid-madhur-emp'],
    createdBy: 'uid-ratan-admin',
    createdAt: '2026-06-12T11:30:00Z',
    updatedAt: '2026-06-12T11:30:00Z',
  },
  {
    projectId: 'proj-client-promo',
    projectCode: 'MS2-PRJ-003',
    projectName: 'Client Promo Video',
    clientName: 'Sony Music India',
    description: 'Choreography cuts, audio synchronizations, visual filter overlay and final render sequence matching.',
    startDate: '2026-06-15',
    deadline: '2026-07-05',
    priority: 'Medium',
    status: 'Active',
    currentStage: 'Early Stage',
    currentCompletionPercent: 20,
    expectedProgressPercent: 10,
    healthStatus: 'Excellent', // 20% vs 10% expected
    assignedEmployeeIds: ['uid-krishna-emp', 'uid-abhishek-emp'],
    createdBy: 'uid-ratan-admin',
    createdAt: '2026-06-15T09:15:00Z',
    updatedAt: '2026-06-15T09:15:00Z',
  }
];

// Seed some initial historical daily updates
const DEFAULT_PROGRESS: DailyProgress[] = [
  {
    progressId: 'uid-madhur-emp_proj-brand-film_2026-06-15',
    employeeUid: 'uid-madhur-emp',
    employeeId: 'MS2-EMP-465',
    employeeName: 'Madhur',
    projectId: 'proj-brand-film',
    projectName: 'Brand Film Edit',
    date: '2026-06-15',
    selectedStage: 'In Progress',
    workSummary: 'Completed the rough cut sequence assembly. Synced standard Dolby audio waveforms with the visual narrative and did introductory typography layout.',
    notes: 'Rough draft is shared on the secure server path under tatapremium_v1.',
    autoCompletionPercent: 55,
    expectedProgressPercent: 25,
    healthStatus: 'Excellent',
    isLocked: true,
    submittedAt: '2026-06-15T18:22:15Z',
  },
  {
    progressId: 'uid-abhishek-emp_proj-client-promo_2026-06-16',
    employeeUid: 'uid-abhishek-emp',
    employeeId: 'MS2-EMP-007',
    employeeName: 'Abhishek',
    projectId: 'proj-client-promo',
    projectName: 'Client Promo Video',
    date: '2026-06-16',
    selectedStage: 'Early Stage',
    workSummary: 'Designed initial motion graphic typography sets and mood boards for the color grade palette.',
    notes: 'Client reviewed the cinematic mood boards and gave greenlight on charcoal aesthetic.',
    autoCompletionPercent: 20,
    expectedProgressPercent: 5,
    healthStatus: 'Excellent',
    isLocked: true,
    submittedAt: '2026-06-16T17:40:02Z',
  },
  {
    progressId: 'uid-madhur-emp_proj-social-campaign_2026-06-16',
    employeeUid: 'uid-madhur-emp',
    employeeId: 'MS2-EMP-465',
    employeeName: 'Madhur',
    projectId: 'proj-social-campaign',
    projectName: 'Social Media Campaign',
    date: '2026-06-16',
    selectedStage: 'Early Stage',
    workSummary: 'Divided the master promo trailer into episodic short format slices. Began sound design effects overlays.',
    notes: 'Requires assets for clip 3 from design department soon.',
    autoCompletionPercent: 20,
    expectedProgressPercent: 31,
    healthStatus: 'Slight Delay',
    isLocked: true,
    submittedAt: '2026-06-16T19:05:54Z',
  }
];

const DEFAULT_LOGS: ActivityLog[] = [
  {
    logId: 'log-1',
    userId: 'uid-ratan-admin',
    username: 'Ratan',
    action: 'Initialized MS2 Studio command center',
    targetType: 'system',
    targetId: 'system',
    timestamp: '2026-06-10T09:00:00Z',
  },
  {
    logId: 'log-2',
    userId: 'uid-ratan-admin',
    username: 'Ratan',
    action: 'Created project code assignment: MS2-PRJ-001',
    targetType: 'project',
    targetId: 'proj-brand-film',
    timestamp: '2026-06-10T10:05:00Z',
  }
];

const DEFAULT_SETTINGS: AppSettings = {
  companyName: 'MS2 Entertainment',
  themeMode: 'dark',
  defaultReminderTime: '18:00',
  projectStages: ['Early Stage', 'In Progress', 'Final Stage', 'Complete'],
  isLocked: true,
};

// -------------------------------------------------------------
// CORE INTERACTIVE STATE class (Fallback / Local Engine)
// -------------------------------------------------------------
class StorageManager {
  private users: User[] = [];
  private projects: Project[] = [];
  private progress: DailyProgress[] = [];
  private logs: ActivityLog[] = [];
  private settings: AppSettings = DEFAULT_SETTINGS;
  private adminNotes: AdminPrivateNotesData = { projects: {}, employees: {}, progress: {} };
  private notifications: InAppNotification[] = [];

  // Sandbox Mode settings for offline/unconfigured testing fallback
  private isSandboxMode: boolean = localStorage.getItem('ms2_sandbox_mode') === 'true';

  // Firebase Synchronizer properties
  private listeners = new Set<() => void>();
  private syncUnsubscribes: (() => void)[] = [];

  constructor() {
    this.loadFromStorage();
    // Listen for authentication state transformations to automatically mount sync routines
    onAuthStateChanged(auth, (firebaseUser) => {
      if (this.isSandboxMode) {
        console.log('[Auth State] Sandbox mode active. Bypassing Firebase synchronization.');
        return;
      }
      if (firebaseUser) {
        const savedSession = localStorage.getItem('ms2_active_session');
        if (savedSession) {
          try {
            const parsed = JSON.parse(savedSession);
            // Verify and map UID matching
            const userWithUid = { ...parsed, uid: firebaseUser.uid };
            this.startFirebaseSync(userWithUid);
          } catch (e) {
            console.warn('Error reading persisted session during auth state transition', e);
          }
        }
      } else {
        this.stopFirebaseSync();
      }
    });
  }

  // --- SANDBOX MODE ACCESSORS ---
  public getSandboxMode(): boolean {
    return this.isSandboxMode;
  }

  public setSandboxMode(enabled: boolean) {
    this.isSandboxMode = enabled;
    localStorage.setItem('ms2_sandbox_mode', enabled ? 'true' : 'false');
    if (enabled) {
      this.stopFirebaseSync();
    }
    this.notifySubscribers();
  }

  // --- STUDIO CINEMATIC MODE ACCESSORS ---
  private isStudioMode: boolean = localStorage.getItem('ms2_studio_mode') !== 'false';

  public getStudioMode(): boolean {
    return this.isStudioMode;
  }

  public setStudioMode(enabled: boolean) {
    this.isStudioMode = enabled;
    localStorage.setItem('ms2_studio_mode', enabled ? 'true' : 'false');
    this.notifySubscribers();
  }

  // --- REACTIVE STATE SUBSCRIBERS ---
  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public notifySubscribers() {
    this.listeners.forEach(listener => {
      try {
        listener();
      } catch (err) {
        console.error('State publication failure', err);
      }
    });
  }

  // --- FIRESTORE PERSISTENCE WRITERS ---
  public async writeToFirestore(collectionName: string, docId: string, data: any) {
    if (this.isSandboxMode) {
      console.log(`[Sandbox Mode] Bypassing Firestore setDoc on: ${collectionName}/${docId}`);
      return;
    }
    try {
      const cleanData = JSON.parse(JSON.stringify(data)); // strip any undefined properties for firestore compliance
      const docRef = doc(db, collectionName, docId);
      await setDoc(docRef, cleanData);
    } catch (err) {
      console.error(`Failure performing write mutation to Firestore location: ${collectionName}/${docId}`, err);
    }
  }

  public async deleteFromFirestore(collectionName: string, docId: string) {
    if (this.isSandboxMode) {
      console.log(`[Sandbox Mode] Bypassing Firestore deleteDoc on: ${collectionName}/${docId}`);
      return;
    }
    try {
      const docRef = doc(db, collectionName, docId);
      await deleteDoc(docRef);
    } catch (err) {
      console.error(`Failure deleting Firestore resource: ${collectionName}/${docId}`, err);
    }
  }

  // --- REAL-TIME SYNCHRONIZER ENGINE ---
  public startFirebaseSync(activeUser: User) {
    this.stopFirebaseSync();
    console.log(`[Firebase Sync] Injecting live snapshot pipelines. Role: ${activeUser.role}, identity: ${activeUser.fullName}`);

    try {
      // 1. User Catalog snap
      if (activeUser.role === 'admin') {
        const unsubUsers = onSnapshot(query(collection(db, 'users')), (snap) => {
          const freshUsers: User[] = [];
          snap.forEach(d => freshUsers.push(d.data() as User));
          if (freshUsers.length > 0) {
            this.users = freshUsers;
            localStorage.setItem('ms2_users', JSON.stringify(freshUsers));
            this.notifySubscribers();
          }
        });
        this.syncUnsubscribes.push(unsubUsers);
      } else {
        const unsubUserSelf = onSnapshot(doc(db, 'users', activeUser.uid), (docSnap) => {
          if (docSnap.exists()) {
            const selfData = docSnap.data() as User;
            this.users = this.users.map(u => u.uid === activeUser.uid ? selfData : u);
            this.notifySubscribers();
          }
        });
        this.syncUnsubscribes.push(unsubUserSelf);
      }

      // 2. Projects snap
      const projQuery = activeUser.role === 'admin'
        ? query(collection(db, 'projects'))
        : query(collection(db, 'projects'), where('assignedEmployeeIds', 'array-contains', activeUser.uid));

      const unsubProjects = onSnapshot(projQuery, (snap) => {
        const freshProjects: Project[] = [];
        snap.forEach(d => freshProjects.push(d.data() as Project));
        this.projects = freshProjects;
        localStorage.setItem('ms2_projects', JSON.stringify(freshProjects));
        this.notifySubscribers();
      });
      this.syncUnsubscribes.push(unsubProjects);

      // 3. Daily Progress updates snap
      const dProgressQuery = activeUser.role === 'admin'
        ? query(collection(db, 'dailyProgress'))
        : query(collection(db, 'dailyProgress'), where('employeeUid', '==', activeUser.uid));

      const unsubProgress = onSnapshot(dProgressQuery, (snap) => {
        const freshProgress: DailyProgress[] = [];
        snap.forEach(d => freshProgress.push(d.data() as DailyProgress));
        this.progress = freshProgress;
        localStorage.setItem('ms2_progress', JSON.stringify(freshProgress));
        this.notifySubscribers();
      });
      this.syncUnsubscribes.push(unsubProgress);

      // 4. Notifications snap
      const notificationQuery = activeUser.role === 'admin'
        ? query(collection(db, 'notifications'))
        : query(collection(db, 'notifications'), where('userId', 'in', [activeUser.uid, 'all']));

      const unsubNotifs = onSnapshot(notificationQuery, (snap) => {
        const freshNotifs: InAppNotification[] = [];
        snap.forEach(d => freshNotifs.push(d.data() as InAppNotification));
        freshNotifs.sort((a,b) => b.timestamp.localeCompare(a.timestamp));
        this.notifications = freshNotifs;
        localStorage.setItem('ms2_notifications', JSON.stringify(freshNotifs));
        this.notifySubscribers();
      });
      this.syncUnsubscribes.push(unsubNotifs);

      // 5. Audit logs snap (Admin only)
      if (activeUser.role === 'admin') {
        const unsubLogs = onSnapshot(query(collection(db, 'activityLogs')), (snap) => {
          const freshLogs: ActivityLog[] = [];
          snap.forEach(d => freshLogs.push(d.data() as ActivityLog));
          freshLogs.sort((a,b) => b.timestamp.localeCompare(a.timestamp));
          this.logs = freshLogs;
          localStorage.setItem('ms2_logs', JSON.stringify(freshLogs));
          this.notifySubscribers();
        });
        this.syncUnsubscribes.push(unsubLogs);
      }

      // 6. Admin Private Notes notes snap (Admin only)
      if (activeUser.role === 'admin') {
        const unsubNotes = onSnapshot(query(collection(db, 'adminPrivateNotes')), (snap) => {
          const freshNotes: AdminPrivateNotesData = { projects: {}, employees: {}, progress: {} };
          snap.forEach(d => {
            const entry = d.data();
            const { targetType, targetRefId, noteText } = entry;
            if (targetType === 'project') {
              freshNotes.projects[targetRefId] = noteText;
            } else if (targetType === 'employee') {
              freshNotes.employees[targetRefId] = noteText;
            } else if (targetType === 'progress') {
              freshNotes.progress[targetRefId] = noteText;
            }
          });
          this.adminNotes = freshNotes;
          localStorage.setItem('ms2_admin_notes', JSON.stringify(freshNotes));
          this.notifySubscribers();
        });
        this.syncUnsubscribes.push(unsubNotes);
      }

    } catch (err) {
      console.error('Failure starting database Snapshot Sync lines:', err);
    }
  }

  public stopFirebaseSync() {
    this.syncUnsubscribes.forEach(unsub => {
      try {
        unsub();
      } catch (e) {
        console.error('Tear down snapshot err:', e);
      }
    });
    this.syncUnsubscribes = [];
  }

  // --- PERSISTENCE INJECTOR/BOOTSTRAPPER ---
  public async seedAllPreloadedCollectionsToFirestore() {
    console.info('Triggering secure seeding of initial database tables into Firebase Firestore...');
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      if (!usersSnap.empty) {
        console.log('Firebase Firestore already seeded with elements. Skipping boot-time mock upload.');
        return;
      }

      // Write users list
      for (const u of DEFAULT_USERS) {
        await setDoc(doc(db, 'users', u.uid), u);
      }

      // Write projects list
      for (const p of DEFAULT_PROJECTS) {
        await setDoc(doc(db, 'projects', p.projectId), p);
      }

      // Write dailyProgress logs
      for (const pr of DEFAULT_PROGRESS) {
        await setDoc(doc(db, 'dailyProgress', pr.progressId), pr);
      }

      // Write logs
      for (const l of DEFAULT_LOGS) {
        await setDoc(doc(db, 'activityLogs', l.logId), l);
      }

      // Seeds standard notification alerts
      const defaultNotifs: InAppNotification[] = [
        {
          notificationId: 'notif-1',
          userId: 'uid-ratan-admin',
          title: 'New Progress Committed',
          message: 'Madhur loaded In Progress details for "Brand Film Edit" on 2026-06-15.',
          type: 'success',
          timestamp: '2026-06-15T18:25:00Z',
          isRead: false
        },
        {
          notificationId: 'notif-2',
          userId: 'uid-ratan-admin',
          title: 'Critical Deadline approaching',
          message: 'Social Media Campaign is due in 8 days and currently has slight delay.',
          type: 'warning',
          timestamp: '2026-06-17T09:00:00Z',
          isRead: false
        },
        {
          notificationId: 'notif-3',
          userId: 'uid-madhur-emp',
          title: 'Urgent Project Assignment',
          message: 'You have been assigned to Netflix Promo - "Social Media Campaign". First stage due this week.',
          type: 'info',
          timestamp: '2026-06-12T11:45:00Z',
          isRead: false
        }
      ];
      for (const n of defaultNotifs) {
        await setDoc(doc(db, 'notifications', n.notificationId), n);
      }

      // Seeds default admin annotations
      const defaultNotes = [
        { noteId: 'note-1', targetType: 'project', targetRefId: 'proj-brand-film', noteText: 'Tata Premium team prefers extra contrast in grades. Keep sequence matching strict.', sentiment: 'Neutral', updatedAt: new Date().toISOString() },
        { noteId: 'note-2', targetType: 'employee', targetRefId: 'uid-madhur-emp', noteText: 'Strong editor. Excellent grading detail. Ensure assignments match narrative skillset.', sentiment: 'Positive', updatedAt: new Date().toISOString() },
        { noteId: 'note-3', targetType: 'progress', targetRefId: 'uid-madhur-emp_proj-brand-film_2026-06-15', noteText: 'Initial cut was highly appreciated. Grade is on point.', sentiment: 'Positive', updatedAt: new Date().toISOString() }
      ];
      for (const nt of defaultNotes) {
        await setDoc(doc(db, 'adminPrivateNotes', nt.noteId), nt);
      }

      console.log('Firebase bootstrap seeds recorded smoothly.');
    } catch (err) {
      console.error('Seeding database failure:', err);
    }
  }

  private loadFromStorage() {
    try {
      const u = localStorage.getItem('ms2_users');
      const p = localStorage.getItem('ms2_projects');
      const pr = localStorage.getItem('ms2_progress');
      const l = localStorage.getItem('ms2_logs');
      const s = localStorage.getItem('ms2_settings');
      const an = localStorage.getItem('ms2_admin_notes');
      const n = localStorage.getItem('ms2_notifications');

      if (u) {
        this.users = JSON.parse(u);
      } else {
        this.users = [...DEFAULT_USERS];
        localStorage.setItem('ms2_users', JSON.stringify(this.users));
      }

      if (p) {
        this.projects = JSON.parse(p);
      } else {
        this.projects = [...DEFAULT_PROJECTS];
        localStorage.setItem('ms2_projects', JSON.stringify(this.projects));
      }

      if (pr) {
        this.progress = JSON.parse(pr);
      } else {
        this.progress = [...DEFAULT_PROGRESS];
        localStorage.setItem('ms2_progress', JSON.stringify(this.progress));
      }

      if (l) {
        this.logs = JSON.parse(l);
      } else {
        this.logs = [...DEFAULT_LOGS];
        localStorage.setItem('ms2_logs', JSON.stringify(this.logs));
      }

      if (s) {
        this.settings = JSON.parse(s);
      } else {
        this.settings = { ...DEFAULT_SETTINGS };
        localStorage.setItem('ms2_settings', JSON.stringify(this.settings));
      }

      if (an) {
        this.adminNotes = JSON.parse(an);
      } else {
        this.adminNotes = {
          projects: {
            'proj-brand-film': 'Tata Premium team prefers extra contrast in grades. Keep sequence matching strict.'
          },
          employees: {
            'uid-madhur-emp': 'Strong editor. Excellent grading detail. Ensure assignments match narrative skillset.'
          },
          progress: {
            'uid-madhur-emp_proj-brand-film_2026-06-15': 'Initial cut was highly appreciated. Grade is on point.'
          }
        };
        localStorage.setItem('ms2_admin_notes', JSON.stringify(this.adminNotes));
      }

      if (n) {
        this.notifications = JSON.parse(n);
      } else {
        this.notifications = [
          {
            notificationId: 'notif-1',
            userId: 'uid-ratan-admin',
            title: 'New Progress Committed',
            message: 'Madhur loaded In Progress details for "Brand Film Edit" on 2026-06-15.',
            type: 'success',
            timestamp: '2026-06-15T18:25:00Z',
            isRead: false
          },
          {
            notificationId: 'notif-2',
            userId: 'uid-ratan-admin',
            title: 'Critical Deadline approaching',
            message: 'Social Media Campaign is due in 8 days and currently has slight delay.',
            type: 'warning',
            timestamp: '2026-06-17T09:00:00Z',
            isRead: false
          },
          {
            notificationId: 'notif-3',
            userId: 'uid-madhur-emp',
            title: 'Urgent Project Assignment',
            message: 'You have been assigned to Netflix Promo - "Social Media Campaign". First stage due this week.',
            type: 'info',
            timestamp: '2026-06-12T11:45:00Z',
            isRead: false
          }
        ];
        localStorage.setItem('ms2_notifications', JSON.stringify(this.notifications));
      }

      // Re-run dynamic expected progress estimates upon load to verify correctness
      this.recalculateAllProjectMetrics();
    } catch (e) {
      console.error('Error loading MS2 Store data, falling back to seeds', e);
      this.users = [...DEFAULT_USERS];
      this.projects = [...DEFAULT_PROJECTS];
      this.progress = [...DEFAULT_PROGRESS];
      this.logs = [...DEFAULT_LOGS];
      this.settings = { ...DEFAULT_SETTINGS };
      this.adminNotes = { projects: {}, employees: {}, progress: {} };
      this.notifications = [];
    }
  }

  private saveChanges(key: 'users' | 'projects' | 'progress' | 'logs' | 'settings') {
    try {
      const storageKey = `ms2_${key}`;
      const data = this[key];
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (e) {
      console.error('Error saving MS2 changes to localStorage', e);
    }
  }

  public recalculateAllProjectMetrics() {
    let changed = false;
    this.projects = this.projects.map(p => {
      const metrics = computeProjectMetrics(p.startDate, p.deadline, p.currentStage);
      if (
        p.currentCompletionPercent !== metrics.actualPercent ||
        p.expectedProgressPercent !== metrics.expectedPercent ||
        p.healthStatus !== metrics.health
      ) {
        changed = true;
        return {
          ...p,
          currentCompletionPercent: metrics.actualPercent,
          expectedProgressPercent: metrics.expectedPercent,
          healthStatus: metrics.health,
          updatedAt: new Date().toISOString()
        };
      }
      return p;
    });

    if (changed) {
      this.saveChanges('projects');
    }
  }

  // -------------------------------------------------------------
  // LOGS UTILITY
  // -------------------------------------------------------------
  public addLog(userId: string, username: string, action: string, targetType: ActivityLog['targetType'], targetId: string) {
    const logId = 'log_' + Math.random().toString(36).substring(2, 9);
    const newLog: ActivityLog = {
      logId,
      userId,
      username,
      action,
      targetType,
      targetId,
      timestamp: new Date().toISOString(),
    };
    this.logs.unshift(newLog);
    this.saveChanges('logs');
    this.writeToFirestore('activityLogs', logId, newLog);
    this.notifySubscribers();
  }

  // -------------------------------------------------------------
  // USER METHODS (Create, Update, Reset)
  // -------------------------------------------------------------
  public getUsers(): User[] {
    return this.users;
  }

  public createUser(userData: {
    fullName: string;
    email: string;
    username: string;
    employeeId: string;
    department?: string;
    designation?: string;
    role: 'admin' | 'employee';
  }): User {
    const uid = 'uid_' + Math.random().toString(36).substring(2, 9);
    const newUser: User = {
      uid,
      ...userData,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.users.push(newUser);
    this.saveChanges('users');
    this.writeToFirestore('users', uid, newUser);
    this.addLog('uid-ratan-admin', 'Ratan', `Created user account: ${userData.fullName} (${userData.employeeId})`, 'employee', uid);
    return newUser;
  }

  public updateUserStatus(uid: string, status: 'active' | 'inactive') {
    this.users = this.users.map(u => {
      if (u.uid === uid) {
        const updated = { ...u, status, updatedAt: new Date().toISOString() };
        this.writeToFirestore('users', uid, updated);
        return updated;
      }
      return u;
    });
    this.saveChanges('users');
    this.addLog('uid-ratan-admin', 'Ratan', `Updated status of user ${uid} to ${status}`, 'employee', uid);
  }

  public deleteUser(uid: string) {
    this.users = this.users.filter(u => u.uid !== uid);
    this.saveChanges('users');
    this.deleteFromFirestore('users', uid);
    // Remove employee from all project assignments as well
    this.projects = this.projects.map(p => {
      if (p.assignedEmployeeIds.includes(uid)) {
        const updated = {
          ...p,
          assignedEmployeeIds: p.assignedEmployeeIds.filter(id => id !== uid),
          updatedAt: new Date().toISOString()
        };
        this.writeToFirestore('projects', p.projectId, updated);
        return updated;
      }
      return p;
    });
    this.saveChanges('projects');
    this.addLog('uid-ratan-admin', 'Ratan', `Permanently deleted user: ${uid}`, 'employee', uid);
  }

  // Local Backup/Sandbox authentication runner
  private authenticateLocally(lowerInput: string, passwordPlain: string): { success: boolean; user?: User; error?: string } {
    console.log('[Sandbox Auth] Initiating local offline authentication process.');
    // Specific admin login from prompt
    if (lowerInput === 'ratan' || lowerInput === 'ratan@ms2.co.in') {
      if (passwordPlain === 'RatanMs2Admin') {
        const adminUser = this.users.find(u => u.username === 'Ratan');
        if (adminUser) {
          const updated = { ...adminUser, lastLogin: new Date().toISOString() };
          this.users = this.users.map(u => u.username === 'Ratan' ? updated : u);
          this.saveChanges('users');
          localStorage.setItem('ms2_active_session', JSON.stringify(updated));
          this.notifySubscribers();
          return { success: true, user: updated };
        }
      } else {
        return { success: false, error: 'Incorrect password for Admin' };
      }
    }

    const email = lowerInput.includes('@') ? lowerInput : `${lowerInput}@ms2.co.in`;
    const matchedUser = this.users.find(u => 
      u.username.toLowerCase() === lowerInput || 
      u.email.toLowerCase() === email
    );

    if (matchedUser) {
      if (matchedUser.status === 'inactive') {
        return { success: false, error: 'Account has been deactivated. Please contact Admin.' };
      }

      if (passwordPlain === matchedUser.employeeId) {
        const updated = { ...matchedUser, lastLogin: new Date().toISOString() };
        this.users = this.users.map(u => u.uid === matchedUser.uid ? updated : u);
        this.saveChanges('users');
        localStorage.setItem('ms2_active_session', JSON.stringify(updated));
        this.notifySubscribers();
        return { success: true, user: updated };
      } else {
        return { success: false, error: 'Incorrect credentials for ' + matchedUser.fullName };
      }
    }

    return { success: false, error: 'User does not exist in the domain directory' };
  }

  // Real Firebase Authentication & Sync mechanism
  public async authenticateUser(usernameOrEmail: string, passwordPlain: string): Promise<{ success: boolean; user?: User; error?: string }> {
    const lowerInput = usernameOrEmail.toLowerCase().trim();
    
    // Check if we are in local sandbox mode already OR if Firebase configuration is not accessible
    if (this.isSandboxMode) {
      return this.authenticateLocally(lowerInput, passwordPlain);
    }

    // 1. Resolve domain email
    let email = lowerInput;
    if (!lowerInput.includes('@')) {
      if (lowerInput === 'ratan') {
        email = 'ratan@ms2.co.in';
      } else {
        const localMatched = this.users.find(u => u.username.toLowerCase() === lowerInput);
        if (localMatched) {
          email = localMatched.email;
        } else {
          email = `${lowerInput}@ms2.co.in`;
        }
      }
    }

    // Resolve matched physical user parameters from default dictionary/local cache
    const matchedUser = this.users.find(u => 
      u.username.toLowerCase() === lowerInput || 
      u.email.toLowerCase() === email
    );

    // Resolve correct password if they use default credentials or override details
    let password = passwordPlain;
    if (lowerInput === 'ratan' && passwordPlain === 'RatanMs2Admin') {
      password = 'RatanMs2AdminPassword!'; // stronger password for firebase
    } else if (lowerInput === 'ratan') {
      // Allow passing regular password directly
    } else if (matchedUser && passwordPlain === matchedUser.employeeId) {
      password = matchedUser.employeeId + 'Pass!'; // stronger password for firebase
    }

    try {
      // 2. Try Firebase Auth Sign In
      const { signInWithEmailAndPassword, createUserWithEmailAndPassword } = await import('firebase/auth');
      
      let userCredential;
      try {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } catch (authErr: any) {
        // If user not found in Firebase Auth, but exists in our local directory, let's auto-create them in Firebase Auth!
        if (authErr.code === 'auth/user-not-found' || authErr.code === 'auth/invalid-credential') {
          if (matchedUser || lowerInput === 'ratan') {
            try {
              userCredential = await createUserWithEmailAndPassword(auth, email, password);
              console.info(`Auto-provisioned Firebase Auth user for ${email}`);
            } catch (createErr: any) {
              // With Firebase email enumeration protection, a wrong password surfaces as
              // invalid-credential, so we land here when the account already exists.
              if (createErr.code === 'auth/email-already-in-use') {
                return { success: false, error: 'Incorrect password. Please try again or use Forgot Password.' };
              }
              throw createErr;
            }
          } else {
            throw authErr;
          }
        } else {
          throw authErr;
        }
      }

      const firebaseUser = userCredential.user;
      
      // 3. Setup user object in Firestore
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      let userProfile: User;
      
      if (userDocSnap.exists()) {
        userProfile = userDocSnap.data() as User;
        // Ensure standard fields match
        userProfile.uid = firebaseUser.uid;
      } else {
        // Bootstrap new Firestore document from matched seed user or default parameters
        userProfile = {
          uid: firebaseUser.uid,
          fullName: matchedUser?.fullName || usernameOrEmail.split('@')[0],
          email: firebaseUser.email || email,
          username: matchedUser?.username || usernameOrEmail.split('@')[0],
          employeeId: matchedUser?.employeeId || 'MS2-' + Math.random().toString().substring(2, 6),
          role: (lowerInput === 'ratan' || matchedUser?.role === 'admin') ? 'admin' : 'employee',
          status: 'active',
          designation: matchedUser?.designation || 'Team Member',
          department: matchedUser?.department || 'Operations',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        };
        await setDoc(userDocRef, userProfile);
        
        // Seeding database if it is the Admin first logging in
        if (userProfile.role === 'admin') {
          await this.seedAllPreloadedCollectionsToFirestore();
        }
      }

      // Check account status
      if (userProfile.status === 'inactive') {
        return { success: false, error: 'Your account is deactivated. Please contact your administrator.' };
      }

      // Update log to record auth entry
      const logId = 'log_' + Math.random().toString(36).substring(2, 9);
      const loginLog = {
        logId,
        userId: userProfile.uid,
        username: userProfile.fullName,
        action: 'Logged in securely (Firebase Auth)',
        targetType: 'system',
        targetId: userProfile.uid,
        timestamp: new Date().toISOString()
      };
      await setDoc(doc(db, 'activityLogs', logId), loginLog);

      // Save session
      localStorage.setItem('ms2_active_session', JSON.stringify(userProfile));
      
      // 4. Start Real-time synchronization
      this.startFirebaseSync(userProfile);

      return { success: true, user: userProfile };

    } catch (err: any) {
      const isUnconfigured = err.code === 'auth/operation-not-allowed' || 
                             (err.message && err.message.includes('auth/operation-not-allowed'));
      
      if (isUnconfigured) {
        console.warn('Firebase Auth is unconfigured (auth/operation-not-allowed). Displaying fallback offline sandbox controls.');
        return { success: false, error: 'firebase-unconfigured' };
      }

      console.error('Firebase Auth sign-in failure:', err);
      let errMsg = err.message || 'Firebase Authentication Rejected.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        errMsg = 'Incorrect credentials. Please verify your workspace login and password.';
      }
      return { success: false, error: errMsg };
    }
  }

  // -------------------------------------------------------------
  // PROJECT METHODS (Create, Update, Assign)
  // -------------------------------------------------------------
  public getProjects(): Project[] {
    return this.projects;
  }

  public getEmployeeProjects(employeeUid: string): Project[] {
    return this.projects.filter(p => p.assignedEmployeeIds.includes(employeeUid));
  }

  public createProject(projectData: {
    projectName: string;
    clientName?: string;
    description: string;
    startDate: string;
    deadline: string;
    priority: 'Low' | 'Medium' | 'High' | 'Critical';
  }): Project {
    const projectId = 'proj_' + Math.random().toString(36).substring(2, 9);
    
    // Auto-generate project code
    const indexStr = String(this.projects.length + 1).padStart(3, '0');
    const projectCode = `MS2-PRJ-${indexStr}`;

    const metrics = computeProjectMetrics(projectData.startDate, projectData.deadline, 'Early Stage');

    const newProject: Project = {
      projectId,
      projectCode,
      ...projectData,
      status: 'Active',
      currentStage: 'Early Stage',
      currentCompletionPercent: metrics.actualPercent,
      expectedProgressPercent: metrics.expectedPercent,
      healthStatus: metrics.health,
      assignedEmployeeIds: [],
      createdBy: 'uid-ratan-admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.projects.push(newProject);
    this.saveChanges('projects');
    this.writeToFirestore('projects', projectId, newProject);
    this.addLog('uid-ratan-admin', 'Ratan', `Created master project: ${projectData.projectName} (${projectCode})`, 'project', projectId);
    return newProject;
  }

  public updateProjectStage(projectId: string, stage: ProjectStage) {
    this.projects = this.projects.map(p => {
      if (p.projectId === projectId) {
        const metrics = computeProjectMetrics(p.startDate, p.deadline, stage);
        const updated = {
          ...p,
          currentStage: stage,
          currentCompletionPercent: metrics.actualPercent,
          expectedProgressPercent: metrics.expectedPercent,
          healthStatus: metrics.health,
          updatedAt: new Date().toISOString()
        };
        this.writeToFirestore('projects', projectId, updated);
        return updated;
      }
      return p;
    });
    this.saveChanges('projects');
  }

  public updateProjectDetails(projectId: string, updates: Partial<Project>) {
    this.projects = this.projects.map(p => {
      if (p.projectId === projectId) {
        const updated = { ...p, ...updates, updatedAt: new Date().toISOString() };
        // Recalculate metrics just in case dates or stage changed
        const metrics = computeProjectMetrics(updated.startDate, updated.deadline, updated.currentStage);
        updated.currentCompletionPercent = metrics.actualPercent;
        updated.expectedProgressPercent = metrics.expectedPercent;
        updated.healthStatus = metrics.health;
        this.writeToFirestore('projects', projectId, updated);
        return updated;
      }
      return p;
    });
    this.saveChanges('projects');
    this.addLog('uid-ratan-admin', 'Ratan', `Updated detailed attributes of project: ${projectId}`, 'project', projectId);
  }

  public assignEmployeesToProject(projectId: string, employeeUids: string[]) {
    this.projects = this.projects.map(p => {
      if (p.projectId === projectId) {
        const updated = {
          ...p,
          assignedEmployeeIds: employeeUids,
          updatedAt: new Date().toISOString()
        };
        this.writeToFirestore('projects', projectId, updated);
        return updated;
      }
      return p;
    });
    this.saveChanges('projects');
    this.addLog('uid-ratan-admin', 'Ratan', `Modified employee assignment list for project: ${projectId}`, 'project', projectId);
  }

  // -------------------------------------------------------------
  // DAILY PROGRESS METHODS (Search, Filters, Submit)
  // -------------------------------------------------------------
  public getDailyProgress(): DailyProgress[] {
    return this.progress;
  }

  public submitDailyProgress(progressData: {
    employeeUid: string;
    projectId: string;
    date: string; // YYYY-MM-DD
    selectedStage: ProjectStage;
    workSummary: string;
    notes?: string;
  }): { success: boolean; error?: string } {
    const employee = this.users.find(u => u.uid === progressData.employeeUid);
    const project = this.projects.find(p => p.projectId === progressData.projectId);

    if (!employee || !project) {
      return { success: false, error: 'Invalid Employee or Project identifier' };
    }

    // Unique progressive key: prevents duplicate uploads
    const progressId = `${progressData.employeeUid}_${progressData.projectId}_${progressData.date}`;

    const exists = this.progress.some(p => p.progressId === progressId);
    if (exists) {
      return { success: false, error: 'Duplicate entry detected! You have already submitted progress for this project on ' + progressData.date };
    }

    // Compute progress percentages at submission time
    const metrics = computeProjectMetrics(project.startDate, project.deadline, progressData.selectedStage);

    const newProgress: DailyProgress = {
      progressId,
      employeeUid: progressData.employeeUid,
      employeeId: employee.employeeId,
      employeeName: employee.fullName,
      projectId: progressData.projectId,
      projectName: project.projectName,
      date: progressData.date,
      selectedStage: progressData.selectedStage,
      workSummary: progressData.workSummary,
      notes: progressData.notes || '',
      autoCompletionPercent: metrics.actualPercent,
      expectedProgressPercent: metrics.expectedPercent,
      healthStatus: metrics.health,
      isLocked: true, // Auto-locked upon submission!
      submittedAt: new Date().toISOString()
    };

    // Update the master project's stage and calculations synchronously!
    this.updateProjectStage(progressData.projectId, progressData.selectedStage);

    // Save progress log
    this.progress.unshift(newProgress);
    this.saveChanges('progress');
    this.writeToFirestore('dailyProgress', progressId, newProgress);

    this.addLog(employee.uid, employee.fullName, `Submitted work summary for project: ${project.projectName} (${progressData.selectedStage})`, 'progress', progressId);

    return { success: true };
  }

  // -------------------------------------------------------------
  // SETTINGS METHODS
  // -------------------------------------------------------------
  public getSettings(): AppSettings {
    return this.settings;
  }

  public updateSettings(settings: Partial<AppSettings>) {
    this.settings = { ...this.settings, ...settings };
    this.saveChanges('settings');
    this.writeToFirestore('settings', 'general', this.settings);
    this.addLog('uid-ratan-admin', 'Ratan', 'Updated app settings', 'system', 'settings');
  }

  public getAdminNotes(): AdminPrivateNotesData {
    return this.adminNotes;
  }

  public saveAdminNote(type: 'projects' | 'employees' | 'progress', id: string, text: string) {
    if (!this.adminNotes[type]) {
      this.adminNotes[type] = {};
    }
    this.adminNotes[type][id] = text;
    localStorage.setItem('ms2_admin_notes', JSON.stringify(this.adminNotes));
    const noteDocId = `${type}_${id}`.replace(/\//g, '_');
    this.writeToFirestore('adminPrivateNotes', noteDocId, {
      noteId: noteDocId,
      type,
      targetId: id,
      text,
      updatedAt: new Date().toISOString()
    });
    this.addLog('uid-ratan-admin', 'Ratan', `Added admin private note for ${type}: ${id}`, 'system', id);
  }

  public getNotifications(userId: string): InAppNotification[] {
    return this.notifications.filter(n => n.userId === userId || n.userId === 'all');
  }

  public addNotification(userId: string, title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') {
    const notificationId = 'notif_' + Math.random().toString(36).substring(2, 9);
    const newNotif: InAppNotification = {
      notificationId,
      userId,
      title,
      message,
      type,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    this.notifications.unshift(newNotif);
    localStorage.setItem('ms2_notifications', JSON.stringify(this.notifications));
    this.writeToFirestore('notifications', notificationId, newNotif);
  }

  public markNotificationAsRead(notificationId: string) {
    this.notifications = this.notifications.map(n => {
      if (n.notificationId === notificationId) {
        const updated = { ...n, isRead: true };
        this.writeToFirestore('notifications', notificationId, updated);
        return updated;
      }
      return n;
    });
    localStorage.setItem('ms2_notifications', JSON.stringify(this.notifications));
  }

  public markAllNotificationsAsRead(userId: string) {
    this.notifications = this.notifications.map(n => {
      if (n.userId === userId || n.userId === 'all') {
        const updated = { ...n, isRead: true };
        this.writeToFirestore('notifications', n.notificationId, updated);
        return updated;
      }
      return n;
    });
    localStorage.setItem('ms2_notifications', JSON.stringify(this.notifications));
  }

  public getEmployeeConsistencyScore(uid: string): { 
    score: 'Excellent' | 'Consistent' | 'Needs Improvement' | 'Irregular'; 
    assignedCount: number; 
    submittedCount: number; 
    missedCount: number; 
    regularityRate: number 
  } {
    const assigned = this.projects.filter(p => p.assignedEmployeeIds.includes(uid));
    const uLogs = this.progress.filter(p => p.employeeUid === uid);
    
    const assignedCount = assigned.length;
    const submittedCount = uLogs.length;
    
    let missedCount = 0;
    const today = new Date(TODAY_DATE_STR);
    
    if (assignedCount > 0) {
      for (let i = 0; i < 7; i++) {
        const checkDay = new Date(today);
        checkDay.setDate(today.getDate() - i);
        const dayStr = checkDay.toISOString().split('T')[0];
        
        const wasAssigned = assigned.some(proj => {
          return dayStr >= proj.startDate && dayStr <= proj.deadline;
        });
        
        if (wasAssigned) {
          const submittedOnDay = uLogs.some(log => log.date === dayStr);
          if (!submittedOnDay) {
            missedCount++;
          }
        }
      }
    }
    
    const totalPotentialDays = assignedCount > 0 ? 7 : 0;
    const regularRate = totalPotentialDays > 0 ? Math.round(((totalPotentialDays - missedCount) / totalPotentialDays) * 100) : 100;
    
    let score: 'Excellent' | 'Consistent' | 'Needs Improvement' | 'Irregular' = 'Consistent';
    if (assignedCount === 0) {
      score = 'Consistent';
    } else {
      if (regularRate >= 80) {
        score = 'Excellent';
      } else if (regularRate >= 50) {
        score = 'Consistent';
      } else if (regularRate >= 25) {
        score = 'Needs Improvement';
      } else {
        score = 'Irregular';
      }
    }
    
    return {
      score,
      assignedCount,
      submittedCount,
      missedCount,
      regularityRate: regularRate
    };
  }

  public getLogs(): ActivityLog[] {
    return this.logs;
  }
}

export const store = new StorageManager();
