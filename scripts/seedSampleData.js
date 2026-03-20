const axios = require('axios');
require('dotenv').config();

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';

// Sample usage log data from user
const sampleUsageLog = {
  "totalCount": 33,
  "items": [
    {
      "id": 758223893,
      "userId": 35013475061,
      "departmentId": 35013420755,
      "agencyId": 0,
      "usageLogDateUtc": "2026-03-20T02:14:08.000Z",
      "ipAddress": "127.0.0.6",
      "sourceModule": "ADMIN",
      "sourceApplication": "RMS",
      "primaryEntityType": "USER",
      "primaryEntityId": 35013475061,
      "primaryEntityDepartmentId": 35013420755,
      "primaryEntityTitle": "Viewed usage logs",
      "completion": "SUCCEEDED",
      "action": "VIEWED_USAGE_LOGS"
    },
    {
      "id": 758221988,
      "userId": 35013475061,
      "departmentId": 35013420755,
      "agencyId": 0,
      "usageLogDateUtc": "2026-03-20T02:10:44.000Z",
      "ipAddress": "3.30.99.89",
      "sourceModule": "RMS_GENERAL",
      "sourceApplication": "RMS",
      "primaryEntityType": "REPORT",
      "primaryEntityId": 0,
      "primaryEntityDepartmentId": 0,
      "primaryEntityTitle": "",
      "completion": "SUCCEEDED",
      "action": "VIEWED_PERSONAL_DASHBOARD"
    },
    {
      "id": 758221961,
      "userId": 35013475061,
      "departmentId": 35013420755,
      "agencyId": 0,
      "usageLogDateUtc": "2026-03-20T02:10:40.000Z",
      "ipAddress": "3.30.99.89",
      "sourceModule": "ADMIN",
      "sourceApplication": "RMS",
      "primaryEntityType": "USER",
      "primaryEntityId": 35013475061,
      "primaryEntityDepartmentId": 35013420755,
      "primaryEntityTitle": "Logging in user - brad.fullwood@mark43.com",
      "completion": "SUCCEEDED",
      "action": "LOGGED_IN"
    },
    {
      "id": 757019860,
      "userId": 35013475061,
      "departmentId": 35013420755,
      "agencyId": 0,
      "usageLogDateUtc": "2026-03-18T20:03:10.000Z",
      "ipAddress": "3.30.99.89",
      "sourceModule": "REPORTS",
      "sourceApplication": "RMS",
      "primaryEntityType": "REPORT",
      "primaryEntityId": 60804620097,
      "primaryEntityDepartmentId": 35013420755,
      "primaryEntityTitle": "240079 Offense/Incident Report: Simple Assault (13B)",
      "completion": "SUCCEEDED",
      "action": "VIEWED_REPORT"
    }
  ],
  "query": {
    "elasticQuery": {
      "departmentIds": [29923790884, 35013420755],
      "usageLogStartDateUtc": "2026-03-13T02:16:05.729Z",
      "usageLogEndDateUtc": "2026-03-20T02:16:06.949Z",
      "excludedIpAddresses": []
    },
    "size": 25,
    "from": 0
  },
  "userProfiles": [
    {
      "createdBy": 35013421476,
      "createdDateUtc": "2022-07-22T17:53:57.000Z",
      "updatedBy": 35013475061,
      "updatedDateUtc": "2026-02-26T15:30:23.000Z",
      "rmsEventId": 68717798298,
      "userId": 35013475061,
      "departmentId": 35013420755,
      "userRoleId": 35013475062,
      "departmentAgencyId": 49221481475,
      "firstName": "Brad",
      "lastName": "Fullwood",
      "dateOfBirth": "1978-01-03",
      "dateHired": "2020-01-01",
      "externalCadId": "1P1",
      "badgeNumber": "1P1",
      "buildAttrId": 35013424479,
      "raceAttrId": 35013435524,
      "sexAttrId": 35013434053,
      "yearsOfExperience": 10,
      "driversLicense": "16004578",
      "driversLicenseTypeAttrId": 35013432655,
      "educationLevelAttrId": 35013424557,
      "employeeTypeAttrId": 35013424428,
      "eyeColorAttrId": 35013426103,
      "hairColorAttrId": 35013431839,
      "ssn": "654-87-8080",
      "dexStateUserId": "BF1234",
      "dateDexCertificationExpires": "2031-04-23",
      "primaryUserGroup": "MARK43_INTERNAL",
      "heightFeet": 6,
      "heightInches": 6,
      "height": 78,
      "weight": 250,
      "employmentTypeAttrId": 35013427768,
      "supervisorUserId": 53417925528,
      "isNonAgency": false,
      "pinNumberHash": "$2a$10$jz6VRznBgtsossObF0P1e.ki3ewrquA8gbffMS8hEOsue3cw4s83u",
      "rawHeightFeet": 6,
      "rawHeightInches": 6
    }
  ]
};

// Sample report history data from user (truncated for brevity)
const sampleReportHistory = {
  "historyEvents": [
    {
      "id": 68691331877,
      "timestampUtc": "2026-02-24T22:29:01.000Z",
      "changedBy": 35013475061,
      "historyEventType": "FIELDS_CHANGED",
      "historyEventCategory": "CONTENT",
      "primaryId": 62993433400,
      "primaryType": "REPORT",
      "primaryName": "Event # 250007",
      "secondaryId": 63086510701,
      "secondaryType": "LOCATION",
      "secondaryName": "WALMART, 1608 W MAGNOLIA AVE, GENEVA, AL 36340, UNITED STATES",
      "linkTypeName": "Reporting Location",
      "changeSet": [
        {
          "fieldName": "Longitude",
          "newValue": -85.899371,
          "historyValueType": "NUMERIC"
        },
        {
          "fieldName": "Latitude",
          "newValue": 31.051352,
          "historyValueType": "NUMERIC"
        }
      ],
      "potentialAttributeIds": []
    },
    {
      "id": 68691331875,
      "timestampUtc": "2026-02-24T22:29:00.000Z",
      "changedBy": 35013475061,
      "historyEventType": "FIELDS_CHANGED",
      "historyEventCategory": "CONTENT",
      "primaryId": 62993433400,
      "primaryType": "REPORT",
      "primaryName": "Event # 250007",
      "secondaryName": "",
      "changeSet": [
        {
          "fieldName": "Personnel Unit",
          "oldValue": 41235573999,
          "newValue": 41235573998,
          "historyValueType": "ATTRIBUTE"
        }
      ],
      "potentialAttributeIds": []
    }
  ],
  "attributes": []
};

async function seedData() {
  try {
    console.log('Seeding usage logs...');
    const usageLogResponse = await axios.post(
      `${API_BASE_URL}/ingest/usage-logs`,
      sampleUsageLog
    );
    console.log('✓ Usage logs seeded:', usageLogResponse.data);

    console.log('\nSeeding report history...');
    const historyResponse = await axios.post(
      `${API_BASE_URL}/ingest/report-history`,
      sampleReportHistory
    );
    console.log('✓ Report history seeded:', historyResponse.data);

    console.log('\n✓ Sample data seeded successfully!');

  } catch (error) {
    console.error('Error seeding data:', error.response?.data || error.message);
    process.exit(1);
  }
}

seedData();
