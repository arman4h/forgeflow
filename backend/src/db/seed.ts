import db, { initializeDatabase } from './connection.js';

const USERS = [
  {
    id: 'usr_1',
    name: 'Arman Khan',
    email: 'arman@university.edu',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    title: 'Computer Science Student & Lead Developer',
  },
  {
    id: 'usr_2',
    name: 'Nadia Rahman',
    email: 'nadia@university.edu',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    title: 'Research Fellow & UI Designer',
  },
  {
    id: 'usr_3',
    name: 'Rahim Chowdhury',
    email: 'rahim@techcorp.io',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    title: 'Backend Systems Engineer',
  },
  {
    id: 'usr_4',
    name: 'Sakib Al-Hasan',
    email: 'sakib@datascience.club',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    title: 'Data Analyst & Event Coordinator',
  },
  {
    id: 'usr_5',
    name: 'Dr. Sarah Jenkins',
    email: 's.jenkins@university.edu',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    title: 'Thesis Supervisor & Advisor',
  },
  {
    id: 'usr_6',
    name: 'Liam Vance',
    email: 'liam@techcorp.io',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80',
    title: 'Product Designer',
  },
];

const SPACES = [
  {
    id: 'sp_1',
    name: 'CSE 320 \u2014 Database Project',
    description: 'Distributed database design and query optimizer capstone project for Fall semester.',
    icon: '\uD83C\uDF93',
    category: 'university',
    is_personal: 0,
    owner_id: 'usr_2',
    invite_code: 'CSE320',
    due_date: '2026-09-10',
    created_at: '2026-08-01T09:00:00Z',
    updated_at: '2026-08-01T09:00:00Z',
  },
  {
    id: 'sp_2',
    name: 'Final Year Project',
    description: 'Autonomous drone pathfinding using lightweight reinforcement learning and edge compute.',
    icon: '\uD83D\uDD2C',
    category: 'research',
    is_personal: 0,
    owner_id: 'usr_1',
    invite_code: 'FYP2026',
    due_date: '2026-10-15',
    created_at: '2026-07-15T10:00:00Z',
    updated_at: '2026-07-15T10:00:00Z',
  },
  {
    id: 'sp_3',
    name: 'Company App',
    description: 'Core product engineering for next-generation mobile commerce MVP.',
    icon: '\uD83C\uDFE2',
    category: 'company',
    is_personal: 0,
    owner_id: 'usr_3',
    invite_code: 'TECHMVP',
    due_date: '2026-08-30',
    created_at: '2026-06-20T08:00:00Z',
    updated_at: '2026-06-20T08:00:00Z',
  },
  {
    id: 'sp_4',
    name: 'Data Science Club',
    description: 'Organizing the 2026 Annual Inter-University AI Hackathon & Workshop series.',
    icon: '\uD83D\uDC65',
    category: 'club',
    is_personal: 0,
    owner_id: 'usr_4',
    invite_code: 'DSCLUB',
    due_date: '2026-09-25',
    created_at: '2026-08-05T14:00:00Z',
    updated_at: '2026-08-05T14:00:00Z',
  },
  {
    id: 'sp_personal',
    name: 'My Space',
    description: 'Personal study routines, portfolio tasks, and independent learning backlog.',
    icon: '\uD83C\uDFE0',
    category: 'personal',
    is_personal: 1,
    owner_id: 'usr_1',
    invite_code: 'PERSONAL',
    due_date: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
];

const SPACE_MEMBERS = [
  { id: 'sm_1', space_id: 'sp_1', user_id: 'usr_2', role: 'owner', joined_at: '2026-08-01T09:00:00Z' },
  { id: 'sm_2', space_id: 'sp_1', user_id: 'usr_1', role: 'member', joined_at: '2026-08-01T09:30:00Z' },
  { id: 'sm_3', space_id: 'sp_1', user_id: 'usr_3', role: 'member', joined_at: '2026-08-02T11:00:00Z' },
  { id: 'sm_4', space_id: 'sp_1', user_id: 'usr_4', role: 'member', joined_at: '2026-08-03T16:20:00Z' },

  { id: 'sm_5', space_id: 'sp_2', user_id: 'usr_1', role: 'owner', joined_at: '2026-07-15T10:00:00Z' },
  { id: 'sm_6', space_id: 'sp_2', user_id: 'usr_2', role: 'member', joined_at: '2026-07-16T14:00:00Z' },
  { id: 'sm_7', space_id: 'sp_2', user_id: 'usr_5', role: 'admin', joined_at: '2026-07-17T09:15:00Z' },

  { id: 'sm_8', space_id: 'sp_3', user_id: 'usr_3', role: 'owner', joined_at: '2026-06-20T08:00:00Z' },
  { id: 'sm_9', space_id: 'sp_3', user_id: 'usr_1', role: 'member', joined_at: '2026-06-22T10:00:00Z' },
  { id: 'sm_10', space_id: 'sp_3', user_id: 'usr_6', role: 'member', joined_at: '2026-06-25T11:30:00Z' },

  { id: 'sm_11', space_id: 'sp_4', user_id: 'usr_4', role: 'owner', joined_at: '2026-08-05T14:00:00Z' },
  { id: 'sm_12', space_id: 'sp_4', user_id: 'usr_1', role: 'member', joined_at: '2026-08-06T15:00:00Z' },
  { id: 'sm_13', space_id: 'sp_4', user_id: 'usr_2', role: 'member', joined_at: '2026-08-07T12:00:00Z' },

  { id: 'sm_14', space_id: 'sp_personal', user_id: 'usr_1', role: 'owner', joined_at: '2026-01-01T00:00:00Z' },
];

const TASKS = [
  {
    id: 'tsk_1',
    space_id: 'sp_1',
    title: 'Complete ER Diagram',
    description: 'Map out the entity-relationship schema for the distributed relational store, including normalization up to 3NF.',
    status: 'in_progress',
    priority: 'high',
    assignee_id: 'usr_1',
    reporter_id: 'usr_2',
    due_date: '2026-08-20',
    created_at: '2026-08-10T10:00:00Z',
    updated_at: '2026-08-15T14:30:00Z',
  },
  {
    id: 'tsk_2',
    space_id: 'sp_1',
    title: 'Database Design & Schema Setup',
    description: 'Write DDL migration scripts for PostgreSQL and establish indexing strategies for high-throughput queries.',
    status: 'in_progress',
    priority: 'medium',
    assignee_id: 'usr_3',
    reporter_id: 'usr_2',
    due_date: '2026-08-23',
    created_at: '2026-08-11T11:00:00Z',
    updated_at: '2026-08-14T09:00:00Z',
  },
  {
    id: 'tsk_3',
    space_id: 'sp_1',
    title: 'Research distributed consensus protocols',
    description: 'Evaluate Raft vs Paxos for state machine replication in our course cluster.',
    status: 'done',
    priority: 'medium',
    assignee_id: 'usr_2',
    reporter_id: 'usr_1',
    due_date: '2026-08-12',
    created_at: '2026-08-05T09:00:00Z',
    updated_at: '2026-08-12T16:00:00Z',
  },
  {
    id: 'tsk_4',
    space_id: 'sp_1',
    title: 'Submit DBMS Final Report',
    description: 'Synthesize performance benchmarks, query explain plans, and final project conclusions into the course template.',
    status: 'todo',
    priority: 'urgent',
    assignee_id: 'usr_1',
    reporter_id: 'usr_2',
    due_date: '2026-09-02',
    created_at: '2026-08-12T14:00:00Z',
    updated_at: '2026-08-12T14:00:00Z',
  },
  {
    id: 'tsk_5',
    space_id: 'sp_1',
    title: 'API Query Gateway Implementation',
    description: 'FastAPI gateway exposing read/write endpoints with JWT authorization.',
    status: 'todo',
    priority: 'high',
    assignee_id: 'usr_4',
    reporter_id: 'usr_3',
    due_date: '2026-08-28',
    created_at: '2026-08-13T10:00:00Z',
    updated_at: '2026-08-13T10:00:00Z',
  },
  {
    id: 'tsk_6',
    space_id: 'sp_2',
    title: 'Review Literature on RL Drone Control',
    description: 'Read and annotate top 10 papers from ICRA and IROS on reinforcement learning for quadrotor obstacle avoidance.',
    status: 'todo',
    priority: 'high',
    assignee_id: 'usr_1',
    reporter_id: 'usr_2',
    due_date: '2026-08-25',
    created_at: '2026-08-08T10:00:00Z',
    updated_at: '2026-08-15T11:00:00Z',
  },
  {
    id: 'tsk_7',
    space_id: 'sp_2',
    title: 'Complete Project Proposal & Scope',
    description: 'Formalize milestone deliverables, flight testing safety boundaries, and hardware budget requirements.',
    status: 'done',
    priority: 'urgent',
    assignee_id: 'usr_2',
    reporter_id: 'usr_5',
    due_date: '2026-08-05',
    created_at: '2026-07-20T09:00:00Z',
    updated_at: '2026-08-05T15:00:00Z',
  },
  {
    id: 'tsk_8',
    space_id: 'sp_2',
    title: 'Setup Gazebo Physics Simulation',
    description: 'Configure realistic drone aerodynamic models and depth camera sensor plugins in ROS2.',
    status: 'in_progress',
    priority: 'high',
    assignee_id: 'usr_1',
    reporter_id: 'usr_1',
    due_date: '2026-09-05',
    created_at: '2026-08-10T12:00:00Z',
    updated_at: '2026-08-16T10:00:00Z',
  },
  {
    id: 'tsk_9',
    space_id: 'sp_3',
    title: 'Fix Authentication & Session Expiry Bug',
    description: 'Resolve token refresh race condition causing occasional 401 logouts during checkout flow.',
    status: 'in_progress',
    priority: 'urgent',
    assignee_id: 'usr_1',
    reporter_id: 'usr_3',
    due_date: '2026-08-18',
    created_at: '2026-08-14T09:00:00Z',
    updated_at: '2026-08-16T17:00:00Z',
  },
  {
    id: 'tsk_10',
    space_id: 'sp_3',
    title: 'Design Mobile Checkout Redesign',
    description: 'Deliver high-fidelity Figma components with Apple Pay and one-tap checkout interactions.',
    status: 'done',
    priority: 'medium',
    assignee_id: 'usr_6',
    reporter_id: 'usr_3',
    due_date: '2026-08-10',
    created_at: '2026-08-01T10:00:00Z',
    updated_at: '2026-08-10T14:00:00Z',
  },
  {
    id: 'tsk_11',
    space_id: 'sp_4',
    title: 'Finalize Hackathon Sponsorship Deck',
    description: 'Compile prospectus with participant demographics and tier packages for tech partners.',
    status: 'todo',
    priority: 'medium',
    assignee_id: 'usr_4',
    reporter_id: 'usr_4',
    due_date: '2026-08-26',
    created_at: '2026-08-12T11:00:00Z',
    updated_at: '2026-08-12T11:00:00Z',
  },
  {
    id: 'tsk_12',
    space_id: 'sp_4',
    title: 'Launch Event Registration Form',
    description: 'Setup registration portal, verify captcha, and connect Google Sheets webhook.',
    status: 'done',
    priority: 'high',
    assignee_id: 'usr_1',
    reporter_id: 'usr_4',
    due_date: '2026-08-15',
    created_at: '2026-08-08T10:00:00Z',
    updated_at: '2026-08-15T18:00:00Z',
  },
  {
    id: 'tsk_13',
    space_id: 'sp_personal',
    title: 'Study Statistics & Probability Distribution',
    description: 'Chapter 4 on Markov Chains and Bayesian Inference for upcoming midterm.',
    status: 'todo',
    priority: 'high',
    assignee_id: 'usr_1',
    reporter_id: 'usr_1',
    due_date: '2026-08-19',
    created_at: '2026-08-14T10:00:00Z',
    updated_at: '2026-08-14T10:00:00Z',
  },
  {
    id: 'tsk_14',
    space_id: 'sp_personal',
    title: 'Finish Portfolio Project Case Study',
    description: 'Write up technical breakdown and interactive demo video for ForgeFlow redesign.',
    status: 'in_progress',
    priority: 'medium',
    assignee_id: 'usr_1',
    reporter_id: 'usr_1',
    due_date: '2026-08-24',
    created_at: '2026-08-12T12:00:00Z',
    updated_at: '2026-08-16T14:00:00Z',
  },
  {
    id: 'tsk_15',
    space_id: 'sp_personal',
    title: 'Read Machine Learning Chapter 8',
    description: 'Deep neural networks and backpropagation mechanics.',
    status: 'done',
    priority: 'low',
    assignee_id: 'usr_1',
    reporter_id: 'usr_1',
    due_date: '2026-08-11',
    created_at: '2026-08-09T08:00:00Z',
    updated_at: '2026-08-11T20:00:00Z',
  },
];

const CHECKLIST_ITEMS = [
  { id: 'chk_1', task_id: 'tsk_1', title: 'Identify all primary keys & foreign keys', completed: 1 },
  { id: 'chk_2', task_id: 'tsk_1', title: 'Normalize customer & order tables', completed: 1 },
  { id: 'chk_3', task_id: 'tsk_1', title: 'Export vector PDF for submission', completed: 0 },

  { id: 'chk_4', task_id: 'tsk_2', title: 'Create base tables DDL', completed: 1 },
  { id: 'chk_5', task_id: 'tsk_2', title: 'Configure B-Tree and GIN indexes', completed: 0 },

  { id: 'chk_6', task_id: 'tsk_3', title: 'Summarize Raft leader election', completed: 1 },
  { id: 'chk_7', task_id: 'tsk_3', title: 'Draft benchmark comparison note', completed: 1 },

  { id: 'chk_8', task_id: 'tsk_4', title: 'Compile latex document', completed: 0 },
  { id: 'chk_9', task_id: 'tsk_4', title: 'Peer review with team', completed: 0 },

  { id: 'chk_10', task_id: 'tsk_6', title: 'Summarize Hwangbo et al. paper', completed: 1 },
  { id: 'chk_11', task_id: 'tsk_6', title: 'Evaluate simulation-to-real transfer methods', completed: 0 },

  { id: 'chk_12', task_id: 'tsk_7', title: 'Sign-off from advisor', completed: 1 },
  { id: 'chk_13', task_id: 'tsk_7', title: 'Submit to department committee', completed: 1 },

  { id: 'chk_14', task_id: 'tsk_9', title: 'Reproduce with slow network throttle', completed: 1 },
  { id: 'chk_15', task_id: 'tsk_9', title: 'Implement mutex lock for token renewal', completed: 0 },
  { id: 'chk_16', task_id: 'tsk_9', title: 'Add unit tests', completed: 0 },

  { id: 'chk_17', task_id: 'tsk_13', title: 'Complete exercise set 4.1 - 4.5', completed: 0 },
  { id: 'chk_18', task_id: 'tsk_13', title: 'Review lecture recordings', completed: 0 },
];

const NOTES = [
  {
    id: 'note_1',
    space_id: 'sp_1',
    title: 'Database Architecture Key Decisions',
    content: '1. Using PostgreSQL with B-tree and GiST indices for spatial query optimization.\n2. Query caching layer using Redis with LRU eviction.\n3. Replication factor of 3 for fault tolerance in final presentation.',
    is_pinned: 1,
    created_at: '2026-08-10T10:00:00Z',
    updated_at: '2026-08-14T14:30:00Z',
  },
  {
    id: 'note_2',
    space_id: 'sp_1',
    title: 'Presentation & Demo Checklist',
    content: '- Slides deck draft due Aug 24.\n- Live benchmark script to showcase 4x speedup with query optimizer.\n- Prepare backup video recording in case WiFi fails.',
    is_pinned: 0,
    created_at: '2026-08-12T11:00:00Z',
    updated_at: '2026-08-15T09:15:00Z',
  },
  {
    id: 'note_3',
    space_id: 'sp_2',
    title: 'Advisor Meeting Notes \u2014 Aug 16',
    content: 'Dr. Sarah recommended comparing our RL agent against standard A* and RRT algorithms on randomized 3D obstacle courses.',
    is_pinned: 1,
    created_at: '2026-08-16T16:00:00Z',
    updated_at: '2026-08-16T16:45:00Z',
  },
];

const MILESTONES = [
  {
    id: 'ms_1',
    space_id: 'sp_1',
    title: 'Phase 1: Relational Schema & ER Diagram',
    description: 'Finalize normalized schema, constraints, and initial SQL migrations.',
    due_date: '2026-08-20',
    status: 'in_progress',
    target_deliverable: 'ERD PDF and SQL schema script',
  },
  {
    id: 'ms_2',
    space_id: 'sp_1',
    title: 'Phase 2: Custom Cost-Based Optimizer Engine',
    description: 'Implement algebraic tree rewrites and cost estimations.',
    due_date: '2026-08-28',
    status: 'upcoming',
    target_deliverable: 'Engine core binary with test suite',
  },
  {
    id: 'ms_3',
    space_id: 'sp_1',
    title: 'Phase 3: Final Demo & Benchmark Report',
    description: 'End-to-end presentation and submission to faculty.',
    due_date: '2026-09-10',
    status: 'upcoming',
    target_deliverable: 'Comprehensive project report',
  },
  {
    id: 'ms_4',
    space_id: 'sp_2',
    title: 'Midterm Research Paper Submission',
    description: 'Draft IEEE format paper with simulation data.',
    due_date: '2026-08-25',
    status: 'in_progress',
    target_deliverable: 'PDF draft to supervisor',
  },
];

const FILES = [
  {
    id: 'fil_1',
    space_id: 'sp_1',
    name: 'CSE320_Project_Proposal.pdf',
    url: 'https://example.com/files/proposal.pdf',
    type: 'pdf',
    size: '2.4 MB',
    uploaded_by_id: 'usr_2',
    uploaded_at: '2026-08-02T10:00:00Z',
  },
  {
    id: 'fil_2',
    space_id: 'sp_1',
    name: 'Database_Schema_v2.sql',
    url: 'https://example.com/files/schema.sql',
    type: 'code',
    size: '48 KB',
    uploaded_by_id: 'usr_3',
    uploaded_at: '2026-08-14T09:15:00Z',
  },
  {
    id: 'fil_3',
    space_id: 'sp_1',
    name: 'Figma System Architecture Diagram',
    url: 'https://figma.com/@cse320-database',
    type: 'link',
    size: null,
    uploaded_by_id: 'usr_1',
    uploaded_at: '2026-08-15T11:00:00Z',
  },
  {
    id: 'fil_4',
    space_id: 'sp_2',
    name: 'Literature_Review_Draft.pdf',
    url: 'https://example.com/files/lit_review.pdf',
    type: 'pdf',
    size: '4.1 MB',
    uploaded_by_id: 'usr_1',
    uploaded_at: '2026-08-08T14:30:00Z',
  },
  {
    id: 'fil_5',
    space_id: 'sp_4',
    name: 'Hackathon_Event_Proposal.pdf',
    url: 'https://example.com/files/event_proposal.pdf',
    type: 'pdf',
    size: '1.8 MB',
    uploaded_by_id: 'usr_4',
    uploaded_at: '2026-08-12T16:00:00Z',
  },
];

const COMMENTS = [
  {
    id: 'com_1',
    task_id: 'tsk_1',
    space_id: 'sp_1',
    author_id: 'usr_1',
    content: 'Can you double-check the 3NF relationships for the order line items before I export?',
    created_at: '2026-08-15T10:20:00Z',
  },
  {
    id: 'com_2',
    task_id: 'tsk_1',
    space_id: 'sp_1',
    author_id: 'usr_2',
    content: 'Yes! Looks clean. I\'ll review the composite keys tonight so we are ready for Rahim\'s DDL scripts.',
    created_at: '2026-08-15T11:05:00Z',
  },
  {
    id: 'com_3',
    task_id: 'tsk_9',
    space_id: 'sp_3',
    author_id: 'usr_3',
    content: 'The token refresh failure happens only when multiple parallel GraphQL queries trigger simultaneously upon initial app launch.',
    created_at: '2026-08-16T15:30:00Z',
  },
  {
    id: 'com_4',
    task_id: 'tsk_9',
    space_id: 'sp_3',
    author_id: 'usr_1',
    content: 'Got it. I added a promise queue resolver to ensure single token exchange. Pushing fix soon.',
    created_at: '2026-08-16T16:45:00Z',
  },
];

const ACTIVITIES = [
  {
    id: 'act_1',
    space_id: 'sp_1',
    user_id: 'usr_2',
    action: 'completed_task',
    entity_title: 'Research distributed consensus protocols',
    details: 'Marked task as Done',
    timestamp: '2026-08-12T16:00:00Z',
    task_id: 'tsk_3',
  },
  {
    id: 'act_2',
    space_id: 'sp_3',
    user_id: 'usr_3',
    action: 'commented',
    entity_title: 'Fix Authentication & Session Expiry Bug',
    details: 'Commented on authentication concurrency',
    timestamp: '2026-08-16T15:30:00Z',
    task_id: 'tsk_9',
  },
  {
    id: 'act_3',
    space_id: 'sp_2',
    user_id: 'usr_2',
    action: 'assigned_task',
    entity_title: 'Review Literature on RL Drone Control',
    details: 'Assigned task to Arman Khan',
    timestamp: '2026-08-08T10:00:00Z',
    task_id: 'tsk_6',
  },
  {
    id: 'act_4',
    space_id: 'sp_4',
    user_id: 'usr_4',
    action: 'uploaded_file',
    entity_title: 'Hackathon_Event_Proposal.pdf',
    details: 'Uploaded document to Files',
    timestamp: '2026-08-12T16:00:00Z',
    task_id: null,
  },
  {
    id: 'act_5',
    space_id: 'sp_1',
    user_id: 'usr_1',
    action: 'status_changed',
    entity_title: 'Complete ER Diagram',
    details: 'Updated checklist progress to 66%',
    timestamp: '2026-08-15T14:30:00Z',
    task_id: 'tsk_1',
  },
  {
    id: 'act_6',
    space_id: 'sp_1',
    user_id: 'usr_3',
    action: 'uploaded_file',
    entity_title: 'Database_Schema_v2.sql',
    details: 'Uploaded migration schema',
    timestamp: '2026-08-14T09:15:00Z',
    task_id: null,
  },
];

const NOTIFICATIONS = [
  {
    id: 'notif_1',
    user_id: 'usr_1',
    space_id: 'sp_2',
    task_id: 'tsk_6',
    title: 'Task Assigned',
    message: 'Nadia assigned you "Review Literature on RL Drone Control"',
    type: 'task_assigned',
    read: 0,
    created_at: '2026-08-17T09:30:00Z',
  },
  {
    id: 'notif_2',
    user_id: 'usr_1',
    space_id: 'sp_3',
    task_id: 'tsk_9',
    title: 'New Comment',
    message: 'Rahim commented on "Fix Authentication & Session Expiry Bug"',
    type: 'comment',
    read: 0,
    created_at: '2026-08-16T15:30:00Z',
  },
  {
    id: 'notif_3',
    user_id: 'usr_1',
    space_id: 'sp_1',
    task_id: 'tsk_1',
    title: 'Deadline Approaching',
    message: '"Complete ER Diagram" is due in 3 days (Aug 20)',
    type: 'deadline_approaching',
    read: 1,
    created_at: '2026-08-15T08:00:00Z',
  },
];

function seed() {
  initializeDatabase();

  const insertUser = db.prepare(
    'INSERT OR IGNORE INTO users (id, name, email, avatar, title) VALUES (?, ?, ?, ?, ?)'
  );
  const insertSpace = db.prepare(
    'INSERT OR IGNORE INTO spaces (id, name, description, icon, category, is_personal, owner_id, invite_code, due_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );
  const insertSpaceMember = db.prepare(
    'INSERT OR IGNORE INTO space_members (id, space_id, user_id, role, joined_at) VALUES (?, ?, ?, ?, ?)'
  );
  const insertTask = db.prepare(
    'INSERT OR IGNORE INTO tasks (id, space_id, title, description, status, priority, assignee_id, reporter_id, due_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );
  const insertChecklistItem = db.prepare(
    'INSERT OR IGNORE INTO checklist_items (id, task_id, title, completed) VALUES (?, ?, ?, ?)'
  );
  const insertNote = db.prepare(
    'INSERT OR IGNORE INTO notes (id, space_id, title, content, is_pinned, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );
  const insertMilestone = db.prepare(
    'INSERT OR IGNORE INTO milestones (id, space_id, title, description, due_date, status, target_deliverable) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );
  const insertFile = db.prepare(
    'INSERT OR IGNORE INTO files (id, space_id, name, url, type, size, uploaded_by_id, uploaded_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  );
  const insertComment = db.prepare(
    'INSERT OR IGNORE INTO comments (id, task_id, space_id, author_id, content, created_at) VALUES (?, ?, ?, ?, ?, ?)'
  );
  const insertActivity = db.prepare(
    'INSERT OR IGNORE INTO activities (id, space_id, user_id, action, entity_title, details, timestamp, task_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  );
  const insertNotification = db.prepare(
    'INSERT OR IGNORE INTO notifications (id, user_id, space_id, task_id, title, message, type, read, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );

  const seedAll = db.transaction(() => {
    for (const u of USERS) {
      insertUser.run(u.id, u.name, u.email, u.avatar, u.title);
    }

    for (const s of SPACES) {
      insertSpace.run(s.id, s.name, s.description, s.icon, s.category, s.is_personal, s.owner_id, s.invite_code, s.due_date, s.created_at, s.updated_at);
    }

    for (const m of SPACE_MEMBERS) {
      insertSpaceMember.run(m.id, m.space_id, m.user_id, m.role, m.joined_at);
    }

    for (const t of TASKS) {
      insertTask.run(t.id, t.space_id, t.title, t.description, t.status, t.priority, t.assignee_id, t.reporter_id, t.due_date, t.created_at, t.updated_at);
    }

    for (const c of CHECKLIST_ITEMS) {
      insertChecklistItem.run(c.id, c.task_id, c.title, c.completed);
    }

    for (const n of NOTES) {
      insertNote.run(n.id, n.space_id, n.title, n.content, n.is_pinned, n.created_at, n.updated_at);
    }

    for (const ms of MILESTONES) {
      insertMilestone.run(ms.id, ms.space_id, ms.title, ms.description, ms.due_date, ms.status, ms.target_deliverable);
    }

    for (const f of FILES) {
      insertFile.run(f.id, f.space_id, f.name, f.url, f.type, f.size, f.uploaded_by_id, f.uploaded_at);
    }

    for (const cm of COMMENTS) {
      insertComment.run(cm.id, cm.task_id, cm.space_id, cm.author_id, cm.content, cm.created_at);
    }

    for (const a of ACTIVITIES) {
      insertActivity.run(a.id, a.space_id, a.user_id, a.action, a.entity_title, a.details, a.timestamp, a.task_id);
    }

    for (const nf of NOTIFICATIONS) {
      insertNotification.run(nf.id, nf.user_id, nf.space_id, nf.task_id, nf.title, nf.message, nf.type, nf.read, nf.created_at);
    }
  });

  seedAll();

  const counts = {
    users: (db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }).count,
    spaces: (db.prepare('SELECT COUNT(*) as count FROM spaces').get() as { count: number }).count,
    space_members: (db.prepare('SELECT COUNT(*) as count FROM space_members').get() as { count: number }).count,
    tasks: (db.prepare('SELECT COUNT(*) as count FROM tasks').get() as { count: number }).count,
    checklist_items: (db.prepare('SELECT COUNT(*) as count FROM checklist_items').get() as { count: number }).count,
    notes: (db.prepare('SELECT COUNT(*) as count FROM notes').get() as { count: number }).count,
    milestones: (db.prepare('SELECT COUNT(*) as count FROM milestones').get() as { count: number }).count,
    files: (db.prepare('SELECT COUNT(*) as count FROM files').get() as { count: number }).count,
    comments: (db.prepare('SELECT COUNT(*) as count FROM comments').get() as { count: number }).count,
    activities: (db.prepare('SELECT COUNT(*) as count FROM activities').get() as { count: number }).count,
    notifications: (db.prepare('SELECT COUNT(*) as count FROM notifications').get() as { count: number }).count,
  };

  console.log('Seed completed. Record counts:');
  for (const [table, count] of Object.entries(counts)) {
    console.log(`  ${table}: ${count}`);
  }
}

seed();
