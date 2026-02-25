================================================================================
KSAA STEMCARE PATIENT MANAGEMENT SYSTEM
Complete Project Documentation
================================================================================

PROJECT OVERVIEW
================================================================================

This is a complete patient management system for KSAA STEMCARE clinic with:
- Patient portal for booking appointments
- Super admin dashboard for clinic management
- Stripe payment integration (Malaysian market)
- Google Calendar synchronization
- Manual notification system (email & WhatsApp)
- Real-time scheduling with quota management

TARGET MARKET: Malaysia (MYR currency)
DEPLOYMENT: Vercel
TECH STACK: Next.js 14, TypeScript, Prisma, PostgreSQL, Tailwind CSS

================================================================================
DOCUMENTATION FILES
================================================================================

This package contains 11 comprehensive documentation files:

00-MAIN-PROMPT.txt
├── Complete instructions for building the system
├── Development approach and phases
├── Success criteria checklist
└── Critical requirements

01-DATABASE-SCHEMA.txt
├── Complete Prisma schema
├── All tables and relationships
├── Sample queries
└── Migration instructions

02-PATIENT-PORTAL-FEATURES.txt
├── Authentication flows
├── Profile management
├── Service browsing
├── 4-step booking flow
├── Appointment management
└── UI components

03-ADMIN-DASHBOARD-FEATURES.txt
├── Admin dashboard overview
├── Patient management
├── Product/service management
├── Appointment management
├── Schedule management
├── Notification queues
├── Payment & refund management
└── Analytics

04-SCHEDULING-SYSTEM.txt
├── Availability checking algorithm
├── Quota tracking system
├── Weekly schedule builder
├── Date overrides
├── Booking flow with race condition handling
└── Calendar generation

05-PAYMENT-SYSTEM.txt
├── Stripe setup for Malaysian market
├── Payment intent creation
├── Full vs Deposit payments
├── Webhook handling
├── Refund processing
└── Receipt generation

06-NOTIFICATION-SYSTEM.txt
├── Manual notification queues
├── Email templates
├── WhatsApp templates
├── Copy-paste workflow
└── Tracking system

07-GOOGLE-CALENDAR-INTEGRATION.txt
├── Google Cloud setup
├── OAuth authentication
├── Event creation/update/deletion
├── Admin connection UI
└── Bulk sync functionality

08-UI-DESIGN-GUIDELINES.txt
├── Color palette
├── Typography
├── Component library (shadcn/ui)
├── Responsive design
├── Patient portal components
├── Admin dashboard components
└── Accessibility guidelines

09-ENVIRONMENT-SETUP.txt
├── Environment variables
├── Database setup
├── Stripe configuration
├── Google Calendar API
├── Vercel deployment
├── Initial admin user creation
└── Development commands

10-FILE-STRUCTURE.txt
├── Complete file tree
├── App router structure
├── API routes
├── Components organization
└── ~120-150 total files

================================================================================
HOW TO USE THIS DOCUMENTATION
================================================================================

FOR AI/LLM BUILDERS:

1. Start by reading 00-MAIN-PROMPT.txt in full
2. Review the DATABASE-SCHEMA (01) to understand data structure
3. Read the specific feature files (02-07) for detailed implementation
4. Use UI-DESIGN-GUIDELINES (08) for styling consistency
5. Follow ENVIRONMENT-SETUP (09) for configuration
6. Use FILE-STRUCTURE (10) as a checklist

FOR HUMAN DEVELOPERS:

1. Read 00-MAIN-PROMPT.txt for project overview
2. Setup environment using 09-ENVIRONMENT-SETUP.txt
3. Create database schema from 01-DATABASE-SCHEMA.txt
4. Build features following the phase approach in main prompt
5. Reference specific feature files as needed
6. Use UI guidelines for consistent design

================================================================================
BUILD ORDER (RECOMMENDED)
================================================================================

PHASE 1: Foundation (Week 1)
✓ Setup Next.js project
✓ Configure database with Prisma
✓ Implement NextAuth.js authentication
✓ Setup basic UI components
✓ Create layouts

PHASE 2: Patient Features (Week 2)
✓ Patient registration and login
✓ Profile management
✓ Service browsing
✓ Appointment calendar view

PHASE 3: Admin Core (Week 3)
✓ Admin login and dashboard
✓ Product management
✓ Weekly schedule builder
✓ Date override system

PHASE 4: Booking & Payment (Week 4)
✓ 4-step booking flow
✓ Stripe integration
✓ Payment confirmation
✓ Quota tracking

PHASE 5: Admin Operations (Week 5)
✓ Patient management
✓ Appointment management
✓ Manual notification queues
✓ Payment tracking

PHASE 6: Advanced Features (Week 6)
✓ Google Calendar integration
✓ Refund system
✓ Analytics dashboard

PHASE 7: Testing & Polish (Week 7)
✓ End-to-end testing
✓ Responsive design
✓ Performance optimization

PHASE 8: Deployment (Week 8)
✓ Vercel deployment
✓ Environment configuration
✓ Production testing

================================================================================
KEY FEATURES SUMMARY
================================================================================

PATIENT PORTAL:
✓ Registration with email verification
✓ Complete medical profile
✓ Browse STEMCARE services
✓ Book appointments with real-time availability
✓ Stripe payment (full or deposit)
✓ View appointment history
✓ Request cancellations/refunds

ADMIN DASHBOARD:
✓ Patient management (CRUD)
✓ Product/service management
✓ Flexible schedule management
✓ Manual email/WhatsApp reminder queues
✓ Appointment tracking
✓ Payment and refund processing
✓ Google Calendar synchronization
✓ Analytics and reporting

SCHEDULING SYSTEM:
✓ Weekly recurring schedule
✓ Date-specific overrides
✓ Product-specific quotas
✓ Real-time availability checking
✓ Race condition protection
✓ Overbooking prevention

PAYMENT SYSTEM:
✓ Stripe for Malaysian market (MYR)
✓ Full payment or deposit options
✓ Secure payment processing
✓ Webhook confirmation
✓ Refund management
✓ Balance tracking

NOTIFICATIONS:
✓ Manual email queue (24h reminders)
✓ Manual WhatsApp queue (24h reminders)
✓ Pre-formatted templates
✓ Copy-to-clipboard functionality
✓ No API costs

CALENDAR SYNC:
✓ Google Calendar integration
✓ Auto-create events on booking
✓ Auto-update on reschedule
✓ Auto-delete on cancellation
✓ Patient details in events

================================================================================
TECHNICAL SPECIFICATIONS
================================================================================

Framework: Next.js 14 (App Router)
Language: TypeScript
Database: PostgreSQL with Prisma ORM
Authentication: NextAuth.js v5
Payments: Stripe (Malaysian market)
Calendar: Google Calendar API
Styling: Tailwind CSS + shadcn/ui
Icons: Lucide React
Deployment: Vercel
Hosting: Vercel (free tier compatible)

No recurring API costs:
✓ Email notifications (manual)
✓ WhatsApp notifications (manual)
✓ Free tier database (Vercel Postgres/Supabase)
✓ Free tier hosting (Vercel)

================================================================================
WHAT MAKES THIS SYSTEM UNIQUE
================================================================================

1. COST-EFFECTIVE
   - Zero recurring costs for notifications
   - Free tier hosting compatible
   - Manual but efficient workflow

2. MALAYSIAN MARKET OPTIMIZED
   - MYR currency
   - Malaysian time zone (GMT+8)
   - DD/MM/YYYY date format
   - Local payment methods support

3. FLEXIBLE SCHEDULING
   - Admin-controlled time slots
   - Service-specific quotas
   - Easy override system
   - No staff management overhead

4. PAYMENT FLEXIBILITY
   - Full payment or deposit
   - Balance tracking
   - Clear refund policy
   - Admin can mark payments as received

5. MANUAL NOTIFICATION CONTROL
   - Admin reviews all messages
   - Personal touch
   - Quality control
   - Customizable templates

6. REAL-TIME QUOTA MANAGEMENT
   - Prevents overbooking
   - Live availability updates
   - Race condition protection

================================================================================
SECURITY FEATURES
================================================================================

✓ Secure password hashing (bcrypt)
✓ Role-based access control (RBAC)
✓ Protected API routes
✓ Stripe payment security
✓ Session management
✓ Input validation and sanitization
✓ SQL injection protection (Prisma)
✓ XSS protection

================================================================================
DEPLOYMENT CHECKLIST
================================================================================

Before going live:

[ ] All environment variables configured in Vercel
[ ] Database migrated and seeded
[ ] Admin user created
[ ] Sample products added
[ ] Default schedule configured
[ ] Stripe account verified and live mode enabled
[ ] Stripe webhook configured with production URL
[ ] Google Calendar OAuth configured with production URL
[ ] Domain configured (Vercel subdomain or custom)
[ ] All features tested end-to-end
[ ] Mobile responsiveness verified
[ ] Payment flow tested in live mode
[ ] Error handling verified
[ ] Loading states implemented
[ ] Security audit completed

================================================================================
SUPPORT & MAINTENANCE
================================================================================

Regular Tasks:
- Daily: Check notification queues
- Daily: Process refund requests
- Weekly: Review appointment analytics
- Weekly: Update schedule if needed
- Monthly: Review payment reports

System Monitoring:
- Stripe dashboard for payments
- Vercel dashboard for deployment status
- Database performance monitoring
- User feedback collection

Updates:
- Keep dependencies updated
- Monitor Stripe API changes
- Check Next.js updates
- Review Google Calendar API changes

================================================================================
SUCCESS METRICS
================================================================================

The system is successful when:

✓ Patients can book appointments without issues
✓ Payments process smoothly
✓ No overbooking occurs
✓ Calendar events sync correctly
✓ Admin can manage all operations efficiently
✓ Response time < 2 seconds
✓ Mobile experience is excellent
✓ Zero payment errors
✓ User satisfaction high

================================================================================
FUTURE ENHANCEMENTS (Optional)
================================================================================

Possible additions after initial launch:

- SMS notifications via Twilio
- Automated email reminders (using Resend)
- Patient portal mobile app
- Multi-location support
- Staff scheduling
- Inventory management
- Automated reporting
- Patient reviews/ratings
- Loyalty program
- Referral system

================================================================================
CONTACT & FEEDBACK
================================================================================

For questions about this documentation:
- Review the specific feature file in detail
- Check the troubleshooting section in 09-ENVIRONMENT-SETUP.txt
- Refer to the main prompt for clarifications

================================================================================
LICENSE & USAGE
================================================================================

This documentation is provided for building the KSAA STEMCARE Patient
Management System. Use it to build a fully functional, production-ready
system following all the specifications provided.

All code and implementations should follow:
- Next.js best practices
- TypeScript strict mode
- Prisma ORM conventions
- Stripe security guidelines
- Google Calendar API best practices
- Accessibility standards (WCAG 2.1 AA)

================================================================================
VERSION HISTORY
================================================================================

v1.0 - February 2026
- Initial complete documentation
- All 11 specification files
- Ready for implementation

================================================================================

REMEMBER: This is a PRODUCTION system, not a prototype.
Every feature must work perfectly and be fully tested.

Build it right the first time! 🚀

================================================================================
