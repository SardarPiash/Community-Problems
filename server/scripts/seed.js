#!/usr/bin/env node
/**
 * CPRS database seed script (Stage 5, SRS Section 13).
 * Seeds admin, authority users, citizens, and sample complaints in varied statuses.
 *
 * Usage: npm run seed
 * Re-runnable: removes previous @cprs.local seed users and their data first.
 */

require('dotenv').config();

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const User = require('../src/models/User');
const Complaint = require('../src/models/Complaint');
const Notification = require('../src/models/Notification');
const { generateComplaintId } = require('../src/utils/complaintId');
const { notifyCitizenOfStatusChange } = require('../src/utils/statusChange');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cprs';
const SEED_EMAIL_DOMAIN = '@cprs.local';

const SEED_USERS = [
  {
    key: 'admin',
    name: 'System Admin',
    email: `admin${SEED_EMAIL_DOMAIN}`,
    phone: '01700000001',
    password: 'Admin123!',
    role: 'admin',
  },
  {
    key: 'authorityRoads',
    name: 'Roads & Drainage Authority',
    email: `authority.roads${SEED_EMAIL_DOMAIN}`,
    phone: '01700000002',
    password: 'Authority123!',
    role: 'authority',
  },
  {
    key: 'authorityWaste',
    name: 'Waste Management Authority',
    email: `authority.waste${SEED_EMAIL_DOMAIN}`,
    phone: '01700000003',
    password: 'Authority123!',
    role: 'authority',
  },
  {
    key: 'citizen1',
    name: 'Rahim Uddin',
    email: `citizen1${SEED_EMAIL_DOMAIN}`,
    phone: '01710000001',
    password: 'Citizen123!',
    role: 'citizen',
  },
  {
    key: 'citizen2',
    name: 'Karima Begum',
    email: `citizen2${SEED_EMAIL_DOMAIN}`,
    phone: '01710000002',
    password: 'Citizen123!',
    role: 'citizen',
  },
];

function daysAgo(days) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

function historyEntry(status, changedById, note, timestamp) {
  return { status, changedBy: changedById, note, timestamp };
}

async function upsertUser(definition) {
  const passwordHash = await bcrypt.hash(definition.password, 12);
  const user = await User.findOneAndUpdate(
    { email: definition.email },
    {
      name: definition.name,
      email: definition.email,
      phone: definition.phone,
      passwordHash,
      role: definition.role,
      status: 'active',
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return user;
}

async function clearPreviousSeedData() {
  const seedUsers = await User.find({
    email: { $regex: SEED_EMAIL_DOMAIN.replace('.', '\\.') + '$' },
  }).select('_id');

  const seedUserIds = seedUsers.map((user) => user._id);
  if (seedUserIds.length === 0) {
    return;
  }

  const seedComplaints = await Complaint.find({
    $or: [{ citizenId: { $in: seedUserIds } }, { assignedAuthorityId: { $in: seedUserIds } }],
  }).select('_id');

  const complaintIds = seedComplaints.map((complaint) => complaint._id);

  await Notification.deleteMany({
    $or: [{ userId: { $in: seedUserIds } }, { complaintId: { $in: complaintIds } }],
  });
  await Complaint.deleteMany({ _id: { $in: complaintIds } });
  await User.deleteMany({ _id: { $in: seedUserIds } });
}

async function createSeededComplaint({
  citizen,
  admin,
  authority,
  category,
  title,
  description,
  location,
  statusHistory,
  assignedAuthorityId = null,
}) {
  const complaintId = await generateComplaintId();
  const finalStatus = statusHistory[statusHistory.length - 1].status;
  const createdAt = statusHistory[0].timestamp;
  const updatedAt = statusHistory[statusHistory.length - 1].timestamp;

  const complaint = await Complaint.create({
    complaintId,
    citizenId: citizen._id,
    category,
    title,
    description,
    location,
    images: [],
    status: finalStatus,
    assignedAuthorityId,
    statusHistory,
    createdAt,
    updatedAt,
  });

  for (let i = 1; i < statusHistory.length; i += 1) {
    if (statusHistory[i].status !== statusHistory[i - 1].status) {
      await notifyCitizenOfStatusChange(citizen._id, complaint._id, statusHistory[i].status);
    }
  }

  return complaint;
}

async function seedComplaints(users) {
  const { admin, authorityRoads, authorityWaste, citizen1, citizen2 } = users;

  const complaints = [];

  complaints.push(
    await createSeededComplaint({
      citizen: citizen1,
      admin,
      authority: authorityRoads,
      category: 'Road Damage',
      title: 'Large pothole on Mirpur Road',
      description: 'Deep pothole near the bus stop causing accidents.',
      location: 'Mirpur Road, Section 10',
      statusHistory: [
        historyEntry(
          'Pending Verification',
          citizen1._id,
          'Complaint submitted',
          daysAgo(1)
        ),
      ],
    })
  );

  complaints.push(
    await createSeededComplaint({
      citizen: citizen1,
      admin,
      authority: authorityWaste,
      category: 'Waste Management',
      title: 'Overflowing garbage bin',
      description: 'Municipal bin not collected for five days.',
      location: 'Dhanmondi Road 27',
      statusHistory: [
        historyEntry(
          'Pending Verification',
          citizen1._id,
          'Complaint submitted',
          daysAgo(5)
        ),
        historyEntry('Verified', admin._id, 'Verified by admin', daysAgo(4)),
      ],
    })
  );

  complaints.push(
    await createSeededComplaint({
      citizen: citizen1,
      admin,
      authority: authorityRoads,
      category: 'Water Leakage',
      title: 'Burst water pipe',
      description: 'Water flooding the street from a broken main line.',
      location: 'Gulshan Avenue, Block C',
      statusHistory: [
        historyEntry(
          'Pending Verification',
          citizen1._id,
          'Complaint submitted',
          daysAgo(7)
        ),
        historyEntry('Rejected', admin._id, 'Duplicate report — already handled', daysAgo(6)),
      ],
    })
  );

  complaints.push(
    await createSeededComplaint({
      citizen: citizen2,
      admin,
      authority: authorityRoads,
      category: 'Streetlight',
      title: 'Streetlight out for two weeks',
      description: 'Dark stretch of road with no working lights.',
      location: 'Banani Road 11',
      statusHistory: [
        historyEntry(
          'Pending Verification',
          citizen2._id,
          'Complaint submitted',
          daysAgo(10)
        ),
        historyEntry('Verified', admin._id, 'Verified by admin', daysAgo(9)),
        historyEntry(
          'Assigned',
          admin._id,
          'Assigned to Roads & Drainage Authority',
          daysAgo(8)
        ),
      ],
      assignedAuthorityId: authorityRoads._id,
    })
  );

  complaints.push(
    await createSeededComplaint({
      citizen: citizen2,
      admin,
      authority: authorityRoads,
      category: 'Drainage',
      title: 'Blocked storm drain',
      description: 'Drain clogged after rain; water pooling on road.',
      location: 'Uttara Sector 7',
      statusHistory: [
        historyEntry(
          'Pending Verification',
          citizen2._id,
          'Complaint submitted',
          daysAgo(12)
        ),
        historyEntry('Verified', admin._id, 'Verified by admin', daysAgo(11)),
        historyEntry(
          'Assigned',
          admin._id,
          'Assigned to Roads & Drainage Authority',
          daysAgo(10)
        ),
        historyEntry(
          'In Progress',
          authorityRoads._id,
          'Crew dispatched to clear drain',
          daysAgo(3)
        ),
      ],
      assignedAuthorityId: authorityRoads._id,
    })
  );

  complaints.push(
    await createSeededComplaint({
      citizen: citizen2,
      admin,
      authority: authorityWaste,
      category: 'Security',
      title: 'Broken park fence',
      description: 'Fence damaged allowing unauthorized access at night.',
      location: 'Ramna Park, East Gate',
      statusHistory: [
        historyEntry(
          'Pending Verification',
          citizen2._id,
          'Complaint submitted',
          daysAgo(20)
        ),
        historyEntry('Verified', admin._id, 'Verified by admin', daysAgo(19)),
        historyEntry(
          'Assigned',
          admin._id,
          'Assigned to Waste Management Authority',
          daysAgo(18)
        ),
        historyEntry(
          'In Progress',
          authorityWaste._id,
          'Repair work started',
          daysAgo(14)
        ),
        historyEntry(
          'Resolved',
          authorityWaste._id,
          'Fence repaired and area secured',
          daysAgo(7)
        ),
      ],
      assignedAuthorityId: authorityWaste._id,
    })
  );

  complaints.push(
    await createSeededComplaint({
      citizen: citizen1,
      admin,
      authority: authorityWaste,
      category: 'Other',
      title: 'Illegal dumping site',
      description: 'Repeated illegal waste dumping behind market.',
      location: 'Old Dhaka, Chawkbazar',
      statusHistory: [
        historyEntry(
          'Pending Verification',
          citizen1._id,
          'Complaint submitted',
          daysAgo(15)
        ),
        historyEntry('Verified', admin._id, 'Verified by admin', daysAgo(14)),
        historyEntry(
          'Assigned',
          admin._id,
          'Assigned to Waste Management Authority',
          daysAgo(13)
        ),
        historyEntry(
          'In Progress',
          authorityWaste._id,
          'Site inspected',
          daysAgo(10)
        ),
        historyEntry(
          'Unable to Resolve',
          authorityWaste._id,
          'Private land — outside jurisdiction',
          daysAgo(8)
        ),
      ],
      assignedAuthorityId: authorityWaste._id,
    })
  );

  return complaints;
}

async function main() {
  console.log('CPRS seed starting…');
  await mongoose.connect(MONGO_URI);

  await clearPreviousSeedData();

  const users = {};
  for (const definition of SEED_USERS) {
    users[definition.key] = await upsertUser(definition);
    console.log(`  user: ${definition.role.padEnd(9)} ${definition.email}`);
  }

  const complaints = await seedComplaints(users);
  console.log(`  complaints: ${complaints.length} created`);

  const notificationCount = await Notification.countDocuments({
    userId: { $in: [users.citizen1._id, users.citizen2._id] },
  });
  console.log(`  notifications: ${notificationCount} for seeded citizens`);

  console.log('\nSeed complete. Credentials: docs/SEED.md');
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error('Seed failed:', err.message);
  await mongoose.disconnect();
  process.exit(1);
});
