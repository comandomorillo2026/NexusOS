-- CreateTable
CREATE TABLE "SalesOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "businessName" TEXT NOT NULL,
    "legalName" TEXT,
    "businessAddress" TEXT,
    "ownerName" TEXT NOT NULL,
    "ownerEmail" TEXT NOT NULL,
    "ownerPhone" TEXT NOT NULL,
    "industrySlug" TEXT NOT NULL,
    "industryName" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'Trinidad & Tobago',
    "planSlug" TEXT NOT NULL,
    "planName" TEXT NOT NULL,
    "planTier" TEXT NOT NULL,
    "billingCycle" TEXT NOT NULL DEFAULT 'monthly',
    "planPriceTtd" REAL NOT NULL,
    "activationFeeTtd" REAL NOT NULL DEFAULT 1250,
    "totalChargedTtd" REAL NOT NULL,
    "currencyUsed" TEXT NOT NULL DEFAULT 'TTD',
    "paymentMethod" TEXT,
    "paymentGatewaySessionId" TEXT,
    "transactionId" TEXT,
    "receiptUrl" TEXT,
    "paymentVerifiedAt" TEXT,
    "paymentVerifiedBy" TEXT,
    "nshTenantId" TEXT,
    "nshTenantSlug" TEXT,
    "invoiceNumber" TEXT,
    "invoiceUrl" TEXT,
    "welcomeEmailSentAt" TEXT,
    "couponCode" TEXT,
    "discountAmountTtd" REAL NOT NULL DEFAULT 0,
    "notes" TEXT,
    "languagePreference" TEXT NOT NULL DEFAULT 'en',
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "ipAddress" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PaymentVerification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "salesOrderId" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "verificationMethod" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "transactionId" TEXT,
    "gatewayResponse" TEXT,
    "receiptFileUrl" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TEXT,
    "rejectionReason" TEXT,
    "amountDeclared" REAL,
    "amountVerified" REAL,
    "currency" TEXT NOT NULL DEFAULT 'TTD',
    "notes" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PaymentVerification_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "SalesOrder" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProvisioningJob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "salesOrderId" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "tenantCreated" BOOLEAN NOT NULL DEFAULT false,
    "nshTenantId" TEXT,
    "subscriptionCreated" BOOLEAN NOT NULL DEFAULT false,
    "userProvisioned" BOOLEAN NOT NULL DEFAULT false,
    "welcomeEmailSent" BOOLEAN NOT NULL DEFAULT false,
    "invoiceGenerated" BOOLEAN NOT NULL DEFAULT false,
    "auditLogged" BOOLEAN NOT NULL DEFAULT false,
    "startedAt" TEXT,
    "completedAt" TEXT,
    "errorLog" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProvisioningJob_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "SalesOrder" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SalesCoupon" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "discountType" TEXT NOT NULL,
    "discountValue" REAL NOT NULL,
    "appliesTo" TEXT NOT NULL,
    "maxUses" INTEGER,
    "timesUsed" INTEGER NOT NULL DEFAULT 0,
    "validFrom" TEXT,
    "validUntil" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "description" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SalesAuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "action" TEXT NOT NULL,
    "orderNumber" TEXT,
    "salesOrderId" TEXT,
    "performedBy" TEXT,
    "performedByEmail" TEXT,
    "details" TEXT,
    "severity" TEXT NOT NULL DEFAULT 'info',
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SalesAuditLog_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "SalesOrder" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Industry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameEs" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "descriptionEn" TEXT NOT NULL,
    "descriptionEs" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "modulesStarter" TEXT,
    "modulesGrowth" TEXT,
    "modulesPremium" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameEs" TEXT NOT NULL,
    "tier" TEXT NOT NULL,
    "priceMonthlyTtd" REAL NOT NULL,
    "priceAnnualTtd" REAL NOT NULL,
    "priceBiannualTtd" REAL NOT NULL,
    "maxUsers" INTEGER NOT NULL,
    "maxBranches" INTEGER NOT NULL,
    "featuresEn" TEXT,
    "featuresEs" TEXT,
    "badgeEn" TEXT,
    "badgeEs" TEXT,
    "badgeColor" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "legalName" TEXT,
    "industrySlug" TEXT NOT NULL,
    "ownerName" TEXT NOT NULL,
    "ownerEmail" TEXT NOT NULL,
    "ownerPhone" TEXT NOT NULL,
    "planSlug" TEXT NOT NULL,
    "billingCycle" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "settings" TEXT,
    "activatedAt" TEXT,
    "currentPeriodStart" TEXT,
    "currentPeriodEnd" TEXT,
    "cancelledAt" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SystemSetting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'ADMIN',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Patient" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "dateOfBirth" TEXT,
    "gender" TEXT,
    "bloodType" TEXT,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "phoneAlt" TEXT,
    "address" TEXT,
    "city" TEXT,
    "country" TEXT NOT NULL DEFAULT 'Trinidad & Tobago',
    "allergies" TEXT,
    "medications" TEXT,
    "conditions" TEXT,
    "emergencyContact" TEXT,
    "insuranceProvider" TEXT,
    "insuranceNumber" TEXT,
    "insurancePlan" TEXT,
    "patientNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "notes" TEXT,
    "tags" TEXT,
    "avatarUrl" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "patientName" TEXT NOT NULL,
    "appointmentNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "date" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT,
    "duration" INTEGER NOT NULL DEFAULT 30,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "type" TEXT NOT NULL DEFAULT 'consultation',
    "providerId" TEXT,
    "providerName" TEXT,
    "price" REAL,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "reminderSmsSent" BOOLEAN NOT NULL DEFAULT false,
    "reminderEmailSent" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "cancellationReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Appointment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MedicalRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "visitDate" TEXT NOT NULL,
    "appointmentId" TEXT,
    "subjective" TEXT,
    "objective" TEXT,
    "assessment" TEXT,
    "plan" TEXT,
    "bloodPressure" TEXT,
    "heartRate" INTEGER,
    "temperature" REAL,
    "weight" REAL,
    "height" REAL,
    "bmi" REAL,
    "oxygenSaturation" INTEGER,
    "chiefComplaint" TEXT,
    "diagnosis" TEXT,
    "notes" TEXT,
    "providerId" TEXT,
    "providerName" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MedicalRecord_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PatientDocument" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "description" TEXT,
    "tags" TEXT,
    "documentDate" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PatientDocument_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "patientId" TEXT,
    "invoiceNumber" TEXT NOT NULL,
    "patientName" TEXT NOT NULL,
    "patientEmail" TEXT,
    "patientPhone" TEXT,
    "patientAddress" TEXT,
    "items" TEXT NOT NULL,
    "subtotal" REAL NOT NULL,
    "tax" REAL NOT NULL DEFAULT 0,
    "discount" REAL NOT NULL DEFAULT 0,
    "total" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "issueDate" TEXT NOT NULL,
    "dueDate" TEXT,
    "paidAt" TEXT,
    "paymentMethod" TEXT,
    "paymentReference" TEXT,
    "notes" TEXT,
    "appointmentId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Invoice_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ClinicService" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "price" REAL NOT NULL,
    "priceCurrency" TEXT NOT NULL DEFAULT 'TTD',
    "duration" INTEGER NOT NULL DEFAULT 30,
    "code" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Provider" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "specialization" TEXT,
    "licenseNumber" TEXT,
    "workingHours" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "avatarUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ClinicConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "clinicName" TEXT NOT NULL,
    "legalName" TEXT,
    "taxId" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "address" TEXT,
    "city" TEXT,
    "country" TEXT NOT NULL DEFAULT 'Trinidad & Tobago',
    "logoUrl" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#6C3FCE',
    "secondaryColor" TEXT NOT NULL DEFAULT '#F0B429',
    "accentColor" TEXT NOT NULL DEFAULT '#C026D3',
    "invoicePrefix" TEXT NOT NULL DEFAULT 'INV',
    "invoiceNotes" TEXT,
    "paymentMethods" TEXT,
    "bankDetails" TEXT,
    "businessHours" TEXT,
    "reminderSettings" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'TTD',
    "currencySymbol" TEXT NOT NULL DEFAULT 'TT$',
    "taxRate" REAL NOT NULL DEFAULT 0,
    "whatsappNumber" TEXT,
    "whatsappEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "businessName" TEXT NOT NULL,
    "ownerName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "country" TEXT,
    "source" TEXT NOT NULL DEFAULT 'sales_portal',
    "utmSource" TEXT,
    "utmCampaign" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "interestedPlan" TEXT,
    "notes" TEXT,
    "assignedTo" TEXT,
    "convertedToTenant" BOOLEAN NOT NULL DEFAULT false,
    "tenantId" TEXT,
    "salesOrderId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SystemUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'TENANT_USER',
    "avatarUrl" TEXT,
    "phone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TEXT,
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorSecret" TEXT,
    "resetToken" TEXT,
    "resetTokenExpires" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "NurseStaff" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT,
    "employeeId" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "role" TEXT NOT NULL DEFAULT 'NURSE',
    "specialization" TEXT,
    "licenseNumber" TEXT,
    "licenseExpiry" TEXT,
    "department" TEXT,
    "avatarUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "hireDate" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "NurseShift" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#6C3FCE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "NurseShiftAssignment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "nurseId" TEXT NOT NULL,
    "shiftId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "station" TEXT,
    "patientsAssigned" TEXT,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "NurseShiftAssignment_nurseId_fkey" FOREIGN KEY ("nurseId") REFERENCES "NurseStaff" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "NurseShiftAssignment_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "NurseShift" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ShiftHandoff" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "givenByNurseId" TEXT NOT NULL,
    "receivedByNurseId" TEXT,
    "shiftDate" TEXT NOT NULL,
    "shiftType" TEXT,
    "situation" TEXT,
    "background" TEXT,
    "assessment" TEXT,
    "recommendation" TEXT,
    "pendingTasks" TEXT,
    "criticalAlerts" TEXT,
    "medicationsDue" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "acknowledgedAt" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ShiftHandoff_givenByNurseId_fkey" FOREIGN KEY ("givenByNurseId") REFERENCES "NurseStaff" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ShiftHandoff_receivedByNurseId_fkey" FOREIGN KEY ("receivedByNurseId") REFERENCES "NurseStaff" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NurseTask" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "patientId" TEXT,
    "assignedToNurseId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'general',
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "dueDate" TEXT,
    "dueTime" TEXT,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurringPattern" TEXT,
    "recurringInterval" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "completedAt" TEXT,
    "completedBy" TEXT,
    "protocolId" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "NurseTask_assignedToNurseId_fkey" FOREIGN KEY ("assignedToNurseId") REFERENCES "NurseStaff" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NursingChecklist" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'general',
    "items" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "NursingChecklistCompletion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "checklistId" TEXT NOT NULL,
    "patientId" TEXT,
    "nurseId" TEXT NOT NULL,
    "completedItems" TEXT NOT NULL,
    "notes" TEXT,
    "shiftDate" TEXT NOT NULL,
    "shiftType" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "VitalSignsLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "patientName" TEXT NOT NULL,
    "nurseId" TEXT,
    "nurseName" TEXT,
    "recordedAt" TEXT NOT NULL,
    "bloodPressureSystolic" INTEGER,
    "bloodPressureDiastolic" INTEGER,
    "bloodPressure" TEXT,
    "heartRate" INTEGER,
    "temperature" REAL,
    "temperatureF" REAL,
    "respiratoryRate" INTEGER,
    "oxygenSaturation" INTEGER,
    "weight" REAL,
    "height" REAL,
    "bmi" REAL,
    "bloodGlucose" REAL,
    "bloodGlucoseType" TEXT,
    "painLevel" INTEGER,
    "painLocation" TEXT,
    "notes" TEXT,
    "alertTriggered" BOOLEAN NOT NULL DEFAULT false,
    "alertReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VitalSignsLog_nurseId_fkey" FOREIGN KEY ("nurseId") REFERENCES "NurseStaff" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MedicationAdministration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "patientName" TEXT NOT NULL,
    "prescriptionId" TEXT,
    "nurseId" TEXT NOT NULL,
    "nurseName" TEXT,
    "medicationName" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "route" TEXT,
    "unit" TEXT,
    "scheduledTime" TEXT,
    "administeredAt" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'administered',
    "reasonHeld" TEXT,
    "reasonRefused" TEXT,
    "administrationSite" TEXT,
    "notes" TEXT,
    "verifiedBy" TEXT,
    "verifiedAt" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MedicationAdministration_nurseId_fkey" FOREIGN KEY ("nurseId") REFERENCES "NurseStaff" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MedicationAdministration_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "Prescription" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NursingNote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "patientName" TEXT NOT NULL,
    "nurseId" TEXT NOT NULL,
    "nurseName" TEXT,
    "noteType" TEXT NOT NULL DEFAULT 'progress',
    "title" TEXT,
    "content" TEXT NOT NULL,
    "shiftDate" TEXT,
    "shiftType" TEXT,
    "isConfidential" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "NursingNote_nurseId_fkey" FOREIGN KEY ("nurseId") REFERENCES "NurseStaff" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NursingProtocol" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "steps" TEXT NOT NULL,
    "warnings" TEXT,
    "equipmentNeeded" TEXT,
    "estimatedDuration" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Prescription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "patientName" TEXT NOT NULL,
    "providerId" TEXT,
    "providerName" TEXT,
    "prescriptionNumber" TEXT NOT NULL,
    "medication" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "route" TEXT,
    "duration" TEXT,
    "quantity" INTEGER,
    "refills" INTEGER NOT NULL DEFAULT 0,
    "refillsRemaining" INTEGER NOT NULL DEFAULT 0,
    "instructions" TEXT,
    "warnings" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "startDate" TEXT NOT NULL,
    "endDate" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "LabTest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "category" TEXT,
    "description" TEXT,
    "preparationInstructions" TEXT,
    "price" REAL,
    "priceCurrency" TEXT NOT NULL DEFAULT 'TTD',
    "turnaroundHours" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "LabOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "patientName" TEXT NOT NULL,
    "providerId" TEXT,
    "providerName" TEXT,
    "tests" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ordered',
    "orderedAt" TEXT NOT NULL,
    "collectedAt" TEXT,
    "processedAt" TEXT,
    "readyAt" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'routine',
    "notes" TEXT,
    "clinicalIndication" TEXT,
    "results" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "InventoryItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "sku" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "unitOfMeasure" TEXT,
    "quantityInStock" INTEGER NOT NULL DEFAULT 0,
    "quantityReserved" INTEGER NOT NULL DEFAULT 0,
    "reorderLevel" INTEGER,
    "reorderQuantity" INTEGER,
    "costPrice" REAL,
    "sellingPrice" REAL,
    "location" TEXT,
    "supplier" TEXT,
    "expiryDate" TEXT,
    "lotNumber" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "InventoryTransaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "reason" TEXT,
    "reference" TEXT,
    "performedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InventoryTransaction_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "InventoryItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Reminder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT,
    "targetEmail" TEXT,
    "targetPhone" TEXT,
    "scheduledFor" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'America/Port_of_Spain',
    "channels" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "sentAt" TEXT,
    "failureReason" TEXT,
    "relatedEntityType" TEXT,
    "relatedEntityId" TEXT,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurringPattern" TEXT,
    "nextOccurrence" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT,
    "userId" TEXT,
    "userEmail" TEXT,
    "userName" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "description" TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "SalesOrder_orderNumber_key" ON "SalesOrder"("orderNumber");

-- CreateIndex
CREATE INDEX "SalesOrder_status_idx" ON "SalesOrder"("status");

-- CreateIndex
CREATE INDEX "SalesOrder_ownerEmail_idx" ON "SalesOrder"("ownerEmail");

-- CreateIndex
CREATE INDEX "SalesOrder_industrySlug_idx" ON "SalesOrder"("industrySlug");

-- CreateIndex
CREATE INDEX "SalesOrder_createdAt_idx" ON "SalesOrder"("createdAt");

-- CreateIndex
CREATE INDEX "PaymentVerification_status_idx" ON "PaymentVerification"("status");

-- CreateIndex
CREATE INDEX "PaymentVerification_salesOrderId_idx" ON "PaymentVerification"("salesOrderId");

-- CreateIndex
CREATE INDEX "ProvisioningJob_status_idx" ON "ProvisioningJob"("status");

-- CreateIndex
CREATE INDEX "ProvisioningJob_salesOrderId_idx" ON "ProvisioningJob"("salesOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "SalesCoupon_code_key" ON "SalesCoupon"("code");

-- CreateIndex
CREATE INDEX "SalesCoupon_code_idx" ON "SalesCoupon"("code");

-- CreateIndex
CREATE INDEX "SalesCoupon_status_idx" ON "SalesCoupon"("status");

-- CreateIndex
CREATE INDEX "SalesAuditLog_action_idx" ON "SalesAuditLog"("action");

-- CreateIndex
CREATE INDEX "SalesAuditLog_createdAt_idx" ON "SalesAuditLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Industry_slug_key" ON "Industry"("slug");

-- CreateIndex
CREATE INDEX "Industry_slug_idx" ON "Industry"("slug");

-- CreateIndex
CREATE INDEX "Industry_status_idx" ON "Industry"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Plan_slug_key" ON "Plan"("slug");

-- CreateIndex
CREATE INDEX "Plan_slug_idx" ON "Plan"("slug");

-- CreateIndex
CREATE INDEX "Plan_tier_idx" ON "Plan"("tier");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_slug_key" ON "Tenant"("slug");

-- CreateIndex
CREATE INDEX "Tenant_slug_idx" ON "Tenant"("slug");

-- CreateIndex
CREATE INDEX "Tenant_ownerEmail_idx" ON "Tenant"("ownerEmail");

-- CreateIndex
CREATE INDEX "Tenant_status_idx" ON "Tenant"("status");

-- CreateIndex
CREATE UNIQUE INDEX "SystemSetting_key_key" ON "SystemSetting"("key");

-- CreateIndex
CREATE INDEX "SystemSetting_key_idx" ON "SystemSetting"("key");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE INDEX "AdminUser_email_idx" ON "AdminUser"("email");

-- CreateIndex
CREATE INDEX "AdminUser_role_idx" ON "AdminUser"("role");

-- CreateIndex
CREATE INDEX "Patient_tenantId_idx" ON "Patient"("tenantId");

-- CreateIndex
CREATE INDEX "Patient_patientNumber_idx" ON "Patient"("patientNumber");

-- CreateIndex
CREATE INDEX "Patient_phone_idx" ON "Patient"("phone");

-- CreateIndex
CREATE INDEX "Appointment_tenantId_idx" ON "Appointment"("tenantId");

-- CreateIndex
CREATE INDEX "Appointment_date_idx" ON "Appointment"("date");

-- CreateIndex
CREATE INDEX "Appointment_status_idx" ON "Appointment"("status");

-- CreateIndex
CREATE INDEX "MedicalRecord_tenantId_idx" ON "MedicalRecord"("tenantId");

-- CreateIndex
CREATE INDEX "MedicalRecord_patientId_idx" ON "MedicalRecord"("patientId");

-- CreateIndex
CREATE INDEX "PatientDocument_tenantId_idx" ON "PatientDocument"("tenantId");

-- CreateIndex
CREATE INDEX "PatientDocument_patientId_idx" ON "PatientDocument"("patientId");

-- CreateIndex
CREATE INDEX "Invoice_tenantId_idx" ON "Invoice"("tenantId");

-- CreateIndex
CREATE INDEX "Invoice_invoiceNumber_idx" ON "Invoice"("invoiceNumber");

-- CreateIndex
CREATE INDEX "Invoice_status_idx" ON "Invoice"("status");

-- CreateIndex
CREATE INDEX "ClinicService_tenantId_idx" ON "ClinicService"("tenantId");

-- CreateIndex
CREATE INDEX "Provider_tenantId_idx" ON "Provider"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "ClinicConfig_tenantId_key" ON "ClinicConfig"("tenantId");

-- CreateIndex
CREATE INDEX "ClinicConfig_tenantId_idx" ON "ClinicConfig"("tenantId");

-- CreateIndex
CREATE INDEX "Lead_email_idx" ON "Lead"("email");

-- CreateIndex
CREATE INDEX "Lead_status_idx" ON "Lead"("status");

-- CreateIndex
CREATE UNIQUE INDEX "SystemUser_email_key" ON "SystemUser"("email");

-- CreateIndex
CREATE INDEX "SystemUser_email_idx" ON "SystemUser"("email");

-- CreateIndex
CREATE INDEX "SystemUser_tenantId_idx" ON "SystemUser"("tenantId");

-- CreateIndex
CREATE INDEX "NurseStaff_tenantId_idx" ON "NurseStaff"("tenantId");

-- CreateIndex
CREATE INDEX "NurseStaff_role_idx" ON "NurseStaff"("role");

-- CreateIndex
CREATE INDEX "NurseStaff_isActive_idx" ON "NurseStaff"("isActive");

-- CreateIndex
CREATE INDEX "NurseShift_tenantId_idx" ON "NurseShift"("tenantId");

-- CreateIndex
CREATE INDEX "NurseShiftAssignment_tenantId_idx" ON "NurseShiftAssignment"("tenantId");

-- CreateIndex
CREATE INDEX "NurseShiftAssignment_date_idx" ON "NurseShiftAssignment"("date");

-- CreateIndex
CREATE INDEX "NurseShiftAssignment_nurseId_idx" ON "NurseShiftAssignment"("nurseId");

-- CreateIndex
CREATE INDEX "ShiftHandoff_tenantId_idx" ON "ShiftHandoff"("tenantId");

-- CreateIndex
CREATE INDEX "ShiftHandoff_shiftDate_idx" ON "ShiftHandoff"("shiftDate");

-- CreateIndex
CREATE INDEX "ShiftHandoff_status_idx" ON "ShiftHandoff"("status");

-- CreateIndex
CREATE INDEX "NurseTask_tenantId_idx" ON "NurseTask"("tenantId");

-- CreateIndex
CREATE INDEX "NurseTask_status_idx" ON "NurseTask"("status");

-- CreateIndex
CREATE INDEX "NurseTask_dueDate_idx" ON "NurseTask"("dueDate");

-- CreateIndex
CREATE INDEX "NurseTask_category_idx" ON "NurseTask"("category");

-- CreateIndex
CREATE INDEX "NursingChecklist_tenantId_idx" ON "NursingChecklist"("tenantId");

-- CreateIndex
CREATE INDEX "NursingChecklist_category_idx" ON "NursingChecklist"("category");

-- CreateIndex
CREATE INDEX "NursingChecklistCompletion_tenantId_idx" ON "NursingChecklistCompletion"("tenantId");

-- CreateIndex
CREATE INDEX "NursingChecklistCompletion_checklistId_idx" ON "NursingChecklistCompletion"("checklistId");

-- CreateIndex
CREATE INDEX "VitalSignsLog_tenantId_idx" ON "VitalSignsLog"("tenantId");

-- CreateIndex
CREATE INDEX "VitalSignsLog_patientId_idx" ON "VitalSignsLog"("patientId");

-- CreateIndex
CREATE INDEX "VitalSignsLog_recordedAt_idx" ON "VitalSignsLog"("recordedAt");

-- CreateIndex
CREATE INDEX "MedicationAdministration_tenantId_idx" ON "MedicationAdministration"("tenantId");

-- CreateIndex
CREATE INDEX "MedicationAdministration_patientId_idx" ON "MedicationAdministration"("patientId");

-- CreateIndex
CREATE INDEX "MedicationAdministration_administeredAt_idx" ON "MedicationAdministration"("administeredAt");

-- CreateIndex
CREATE INDEX "MedicationAdministration_status_idx" ON "MedicationAdministration"("status");

-- CreateIndex
CREATE INDEX "NursingNote_tenantId_idx" ON "NursingNote"("tenantId");

-- CreateIndex
CREATE INDEX "NursingNote_patientId_idx" ON "NursingNote"("patientId");

-- CreateIndex
CREATE INDEX "NursingNote_noteType_idx" ON "NursingNote"("noteType");

-- CreateIndex
CREATE INDEX "NursingProtocol_tenantId_idx" ON "NursingProtocol"("tenantId");

-- CreateIndex
CREATE INDEX "NursingProtocol_category_idx" ON "NursingProtocol"("category");

-- CreateIndex
CREATE INDEX "Prescription_tenantId_idx" ON "Prescription"("tenantId");

-- CreateIndex
CREATE INDEX "Prescription_patientId_idx" ON "Prescription"("patientId");

-- CreateIndex
CREATE INDEX "Prescription_status_idx" ON "Prescription"("status");

-- CreateIndex
CREATE INDEX "LabTest_tenantId_idx" ON "LabTest"("tenantId");

-- CreateIndex
CREATE INDEX "LabTest_category_idx" ON "LabTest"("category");

-- CreateIndex
CREATE UNIQUE INDEX "LabOrder_orderId_key" ON "LabOrder"("orderId");

-- CreateIndex
CREATE INDEX "LabOrder_tenantId_idx" ON "LabOrder"("tenantId");

-- CreateIndex
CREATE INDEX "LabOrder_patientId_idx" ON "LabOrder"("patientId");

-- CreateIndex
CREATE INDEX "LabOrder_status_idx" ON "LabOrder"("status");

-- CreateIndex
CREATE INDEX "InventoryItem_tenantId_idx" ON "InventoryItem"("tenantId");

-- CreateIndex
CREATE INDEX "InventoryItem_category_idx" ON "InventoryItem"("category");

-- CreateIndex
CREATE INDEX "InventoryTransaction_tenantId_idx" ON "InventoryTransaction"("tenantId");

-- CreateIndex
CREATE INDEX "InventoryTransaction_itemId_idx" ON "InventoryTransaction"("itemId");

-- CreateIndex
CREATE INDEX "Reminder_tenantId_idx" ON "Reminder"("tenantId");

-- CreateIndex
CREATE INDEX "Reminder_status_idx" ON "Reminder"("status");

-- CreateIndex
CREATE INDEX "Reminder_scheduledFor_idx" ON "Reminder"("scheduledFor");

-- CreateIndex
CREATE INDEX "ActivityLog_tenantId_idx" ON "ActivityLog"("tenantId");

-- CreateIndex
CREATE INDEX "ActivityLog_userId_idx" ON "ActivityLog"("userId");

-- CreateIndex
CREATE INDEX "ActivityLog_entityType_idx" ON "ActivityLog"("entityType");

-- CreateIndex
CREATE INDEX "ActivityLog_createdAt_idx" ON "ActivityLog"("createdAt");
