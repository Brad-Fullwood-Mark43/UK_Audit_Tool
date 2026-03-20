const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

const propertyReportHistory = {
  "historyEvents": [
    {
      "id": 56575338095,
      "timestampUtc": "2024-06-05T04:23:10.000Z",
      "changedBy": 35013475061,
      "historyEventType": "FIELDS_CHANGED",
      "historyEventCategory": "CONTENT",
      "primaryId": 56402486814,
      "primaryType": "ITEM_PROFILE",
      "primaryName": "test - Item ID 240019-1",
      "secondaryName": "",
      "changeSet": [
        {
          "fieldName": "Reason for Police Custody",
          "oldValue": 35013428967,
          "newValue": 35013432141,
          "historyValueType": "ATTRIBUTE"
        }
      ],
      "directionalPrefix": "Property Status: Stolen (NIBRS)",
      "potentialAttributeIds": []
    },
    {
      "id": 56462188741,
      "timestampUtc": "2024-05-30T16:31:21.000Z",
      "changedBy": 35013475061,
      "historyEventType": "FIELDS_CHANGED",
      "historyEventCategory": "CONTENT",
      "primaryId": 56402486814,
      "primaryType": "ITEM_PROFILE",
      "primaryName": "test - Item ID 240019-1",
      "secondaryId": 50961820843,
      "secondaryType": "LOCATION",
      "secondaryName": "TARGET, 1230 S LONGMORE, MESA, AZ 85202, UNITED STATES",
      "linkTypeName": "Property Recovered Location",
      "changeSet": [
        {
          "fieldName": "",
          "newValue": 33.391855,
          "historyValueType": "NUMERIC"
        },
        {
          "fieldName": "",
          "newValue": -111.865182,
          "historyValueType": "NUMERIC"
        }
      ],
      "potentialAttributeIds": []
    },
    {
      "id": 56462188740,
      "timestampUtc": "2024-05-30T16:31:21.000Z",
      "changedBy": 35013475061,
      "historyEventType": "FIELDS_CHANGED",
      "historyEventCategory": "CONTENT",
      "primaryId": 56402486814,
      "primaryType": "ITEM_PROFILE",
      "primaryName": "test - Item ID 240019-1",
      "secondaryName": "",
      "changeSet": [
        {
          "fieldName": "Secondary Color",
          "newValue": 35013429744,
          "historyValueType": "ATTRIBUTE"
        },
        {
          "fieldName": "Size",
          "newValue": "sizefield",
          "historyValueType": "STRING"
        }
      ],
      "potentialAttributeIds": []
    },
    {
      "id": 56402486884,
      "timestampUtc": "2024-05-24T19:08:51.000Z",
      "changedBy": 35013475061,
      "historyEventType": "REPORT_STATUS",
      "historyEventCategory": "WORKFLOW",
      "primaryId": 56402486782,
      "primaryType": "REPORT",
      "primaryName": "Report",
      "changeSet": [],
      "approvalStatus": "COMPLETED",
      "clientApprovalStatus": "COMPLETED",
      "potentialAttributeIds": []
    },
    {
      "id": 56402486883,
      "timestampUtc": "2024-05-24T19:08:51.000Z",
      "changedBy": 35013475061,
      "historyEventType": "REPORT_STATUS",
      "historyEventCategory": "WORKFLOW",
      "primaryId": 56402486782,
      "primaryType": "REPORT",
      "primaryName": "Report",
      "changeSet": [],
      "approvalStatus": "SUBMITTED",
      "clientApprovalStatus": "PENDING_SUPERVISOR_REVIEW",
      "potentialAttributeIds": []
    },
    {
      "id": 56402486823,
      "timestampUtc": "2024-05-24T19:08:50.000Z",
      "changedBy": 35013475061,
      "historyEventType": "LINK_CREATION",
      "historyEventCategory": "CONTENT",
      "primaryId": 56402486814,
      "primaryType": "ITEM_PROFILE",
      "primaryName": "test - Item ID 240019-1",
      "secondaryId": 50961820843,
      "secondaryType": "LOCATION",
      "secondaryName": "TARGET, 1230 S LONGMORE, MESA, AZ 85202, UNITED STATES",
      "linkTypeName": "Property Recovered Location",
      "changeSet": [],
      "potentialAttributeIds": []
    },
    {
      "id": 56402486819,
      "timestampUtc": "2024-05-24T19:08:50.000Z",
      "changedBy": 35013475061,
      "historyEventType": "ENTITY_CREATION",
      "historyEventCategory": "CONTENT",
      "primaryId": 56402486814,
      "primaryType": "ITEM_PROFILE",
      "primaryName": "test - Item ID 240019-1",
      "secondaryName": "",
      "changeSet": [],
      "directionalPrefix": "Property Status: Stolen (NIBRS)",
      "potentialAttributeIds": []
    },
    {
      "id": 56402486814,
      "timestampUtc": "2024-05-24T19:08:50.000Z",
      "changedBy": 35013475061,
      "historyEventType": "ENTITY_CREATION",
      "historyEventCategory": "CONTENT",
      "primaryId": 56402486814,
      "primaryType": "ITEM_PROFILE",
      "primaryName": "test - Item ID 240019-1",
      "secondaryName": "",
      "changeSet": [
        {
          "fieldName": "Description",
          "newValue": "test",
          "historyValueType": "STRING"
        }
      ],
      "potentialAttributeIds": []
    },
    {
      "id": 56402486787,
      "timestampUtc": "2024-05-24T19:08:50.000Z",
      "changedBy": 35013475061,
      "historyEventType": "ENTITY_PERMISSION_CREATED",
      "historyEventCategory": "WORKFLOW",
      "primaryId": 35013421710,
      "primaryType": "ROLE",
      "primaryName": "Role: Property/Evidence",
      "secondaryName": "Can Edit",
      "linkTypeName": "",
      "changeSet": [],
      "potentialAttributeIds": []
    },
    {
      "id": 56402486786,
      "timestampUtc": "2024-05-24T19:08:50.000Z",
      "changedBy": 35013475061,
      "historyEventType": "ENTITY_PERMISSION_CREATED",
      "historyEventCategory": "WORKFLOW",
      "primaryId": 35013421713,
      "primaryType": "ROLE",
      "primaryName": "Role: Property/Evidence Supervisor",
      "secondaryName": "Can Manage",
      "linkTypeName": "",
      "changeSet": [],
      "potentialAttributeIds": []
    },
    {
      "id": 56402486785,
      "timestampUtc": "2024-05-24T19:08:50.000Z",
      "changedBy": 35013475061,
      "historyEventType": "ENTITY_PERMISSION_CREATED",
      "historyEventCategory": "WORKFLOW",
      "primaryId": 35013475062,
      "primaryType": "ROLE",
      "primaryName": "Role: brad.fullwood@mark43.com",
      "secondaryName": "Can Edit",
      "linkTypeName": "",
      "changeSet": [],
      "potentialAttributeIds": []
    },
    {
      "id": 56402486784,
      "timestampUtc": "2024-05-24T19:08:50.000Z",
      "changedBy": 35013475061,
      "historyEventType": "ENTITY_PERMISSION_CREATED",
      "historyEventCategory": "WORKFLOW",
      "primaryId": 35013421706,
      "primaryType": "ROLE",
      "primaryName": "Role: Patrol Supervisor",
      "secondaryName": "Can Manage",
      "linkTypeName": "",
      "changeSet": [],
      "potentialAttributeIds": []
    },
    {
      "id": 56402486783,
      "timestampUtc": "2024-05-24T19:08:50.000Z",
      "changedBy": 35013475061,
      "historyEventType": "ENTITY_PERMISSION_CREATED",
      "historyEventCategory": "WORKFLOW",
      "primaryId": 35013420756,
      "primaryType": "ROLE",
      "primaryName": "Role: Department - fullwooddemo",
      "secondaryName": "Can Find",
      "linkTypeName": "",
      "changeSet": [],
      "potentialAttributeIds": []
    },
    {
      "id": 56402486782,
      "timestampUtc": "2024-05-24T19:08:50.000Z",
      "changedBy": 35013475061,
      "historyEventType": "ENTITY_CREATION",
      "historyEventCategory": "CONTENT",
      "primaryId": 56402486782,
      "primaryType": "REPORT",
      "primaryName": "Event # 240019",
      "secondaryName": "",
      "changeSet": [],
      "potentialAttributeIds": []
    },
    {
      "id": 56402484824,
      "timestampUtc": "2024-05-24T19:08:35.000Z",
      "changedBy": 35013475061,
      "historyEventType": "LINK_CREATION",
      "historyEventCategory": "CONTENT",
      "primaryId": 56073184558,
      "primaryType": "REPORTING_EVENT",
      "primaryName": "Event # 240019",
      "secondaryId": 56402484805,
      "secondaryType": "ITEM_PROFILE",
      "secondaryName": "",
      "changeSet": [],
      "potentialAttributeIds": []
    },
    {
      "id": 56277875463,
      "timestampUtc": "2024-05-22T19:25:52.000Z",
      "changedBy": 35013475061,
      "historyEventType": "ENTITY_CREATION",
      "historyEventCategory": "CONTENT",
      "primaryId": 56073184558,
      "primaryType": "REPORTING_EVENT",
      "primaryName": "Event # 240019",
      "secondaryName": "",
      "changeSet": [],
      "potentialAttributeIds": []
    }
  ]
};

async function seedPropertyReport() {
  try {
    console.log('Seeding Property/Evidence report history...');

    const response = await axios.post(`${API_BASE_URL}/ingest/report-history`, propertyReportHistory);

    console.log('\n✓ Property/Evidence Report History seeded successfully');
    console.log(`  Total events in payload: ${propertyReportHistory.historyEvents.length}`);
    console.log(`  Events inserted: ${response.data.inserted}`);

  } catch (error) {
    console.error('Error seeding property report:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    process.exit(1);
  }
}

seedPropertyReport();
