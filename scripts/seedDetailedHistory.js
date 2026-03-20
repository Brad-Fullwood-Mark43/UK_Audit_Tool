const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

const detailedHistoryPayload = {
  "historyEvents": [
    {
      "id": 64399004562,
      "timestampUtc": "2025-06-08T14:54:55.000Z",
      "changedBy": 35013421476,
      "historyEventType": "REPORT_STATUS",
      "historyEventCategory": "WORKFLOW",
      "primaryId": 54713608189,
      "primaryType": "REPORT",
      "primaryName": "Report",
      "changeSet": [],
      "approvalStatus": "COMPLETED",
      "secondaryApprovalStatus": "COMPLETED",
      "clientApprovalStatus": "COMPLETED",
      "potentialAttributeIds": []
    },
    {
      "id": 64398242765,
      "timestampUtc": "2025-06-08T14:42:07.000Z",
      "changedBy": 35013421476,
      "historyEventType": "REPORT_STATUS",
      "historyEventCategory": "WORKFLOW",
      "primaryId": 54713608189,
      "primaryType": "REPORT",
      "primaryName": "Report",
      "changeSet": [],
      "approvalStatus": "COMPLETED",
      "clientApprovalStatus": "COMPLETED",
      "potentialAttributeIds": []
    },
    {
      "id": 55728257372,
      "timestampUtc": "2024-04-29T20:41:02.000Z",
      "changedBy": 35013475061,
      "historyEventType": "ENTITY_DELETE",
      "historyEventCategory": "CONTENT",
      "primaryId": 55725027154,
      "primaryType": "PERSON_PROFILE",
      "primaryName": "Jeff Smith",
      "secondaryName": "",
      "changeSet": [],
      "directionalPrefix": "Injury: Ankle, Left - Apparent Broken Bones",
      "potentialAttributeIds": []
    },
    {
      "id": 55728257371,
      "timestampUtc": "2024-04-29T20:41:02.000Z",
      "changedBy": 35013475061,
      "historyEventType": "ENTITY_CREATION",
      "historyEventCategory": "CONTENT",
      "primaryId": 55725027154,
      "primaryType": "PERSON_PROFILE",
      "primaryName": "Jeff Smith",
      "secondaryName": "",
      "changeSet": [],
      "directionalPrefix": "Injury: Ankle, Left - Other Major Injury",
      "potentialAttributeIds": []
    },
    {
      "id": 55728249988,
      "timestampUtc": "2024-04-29T20:40:10.000Z",
      "changedBy": 35013475061,
      "historyEventType": "FIELDS_CHANGED",
      "historyEventCategory": "CONTENT",
      "primaryId": 55726639064,
      "primaryType": "ITEM_PROFILE",
      "primaryName": "fdf - Item ID 240008-3",
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
      "id": 55728249922,
      "timestampUtc": "2024-04-29T20:40:09.000Z",
      "changedBy": 35013475061,
      "historyEventType": "FIELDS_CHANGED",
      "historyEventCategory": "CONTENT",
      "primaryId": 55726639064,
      "primaryType": "ITEM_PROFILE",
      "primaryName": "fdf - Item ID 240008-3",
      "secondaryName": "",
      "changeSet": [
        {
          "fieldName": "Serial #",
          "newValue": "343",
          "historyValueType": "STRING"
        }
      ],
      "potentialAttributeIds": []
    },
    {
      "id": 55726682624,
      "timestampUtc": "2024-04-29T17:51:26.000Z",
      "changedBy": 35013475061,
      "historyEventType": "LABEL_DELETION",
      "historyEventCategory": "WORKFLOW",
      "primaryId": 54713608189,
      "primaryType": "REPORT",
      "primaryName": "Event # 240008",
      "secondaryId": 35013434003,
      "secondaryName": "",
      "changeSet": [
        {
          "fieldName": "attributeId",
          "oldValue": 35013434003,
          "historyValueType": "ATTRIBUTE"
        }
      ],
      "potentialAttributeIds": []
    },
    {
      "id": 55726682623,
      "timestampUtc": "2024-04-29T17:51:26.000Z",
      "changedBy": 35013475061,
      "historyEventType": "LABEL_DELETION",
      "historyEventCategory": "WORKFLOW",
      "primaryId": 54713608189,
      "primaryType": "REPORT",
      "primaryName": "Event # 240008",
      "secondaryId": 54604892827,
      "secondaryName": "",
      "changeSet": [
        {
          "fieldName": "attributeId",
          "oldValue": 54604892827,
          "historyValueType": "ATTRIBUTE"
        }
      ],
      "potentialAttributeIds": []
    },
    {
      "id": 55726668243,
      "timestampUtc": "2024-04-29T17:50:56.000Z",
      "changedBy": 35013421476,
      "historyEventType": "LABEL_CREATION",
      "historyEventCategory": "WORKFLOW",
      "primaryId": 54713608189,
      "primaryType": "REPORT",
      "primaryName": "Event # 240008",
      "secondaryId": 35013434003,
      "secondaryName": "",
      "changeSet": [
        {
          "fieldName": "attributeId",
          "newValue": 35013434003,
          "historyValueType": "ATTRIBUTE"
        }
      ],
      "potentialAttributeIds": []
    },
    {
      "id": 55726668228,
      "timestampUtc": "2024-04-29T17:50:56.000Z",
      "changedBy": 35013421476,
      "historyEventType": "LABEL_CREATION",
      "historyEventCategory": "WORKFLOW",
      "primaryId": 54713608189,
      "primaryType": "REPORT",
      "primaryName": "Event # 240008",
      "secondaryId": 54604892827,
      "secondaryName": "",
      "changeSet": [
        {
          "fieldName": "attributeId",
          "newValue": 54604892827,
          "historyValueType": "ATTRIBUTE"
        }
      ],
      "potentialAttributeIds": []
    },
    {
      "id": 55726646220,
      "timestampUtc": "2024-04-29T17:50:17.000Z",
      "changedBy": 35013475061,
      "historyEventType": "REPORT_STATUS",
      "historyEventCategory": "WORKFLOW",
      "primaryId": 54713608189,
      "primaryType": "REPORT",
      "primaryName": "Report",
      "changeSet": [],
      "approvalStatus": "SUBMITTED",
      "clientApprovalStatus": "PENDING_SUPERVISOR_REVIEW",
      "potentialAttributeIds": []
    },
    {
      "id": 55726639176,
      "timestampUtc": "2024-04-29T17:50:02.000Z",
      "changedBy": 35013475061,
      "historyEventType": "LINK_CREATION",
      "historyEventCategory": "CONTENT",
      "primaryId": 55726639064,
      "primaryType": "ITEM_PROFILE",
      "primaryName": "fdf - Item ID 240008-3",
      "secondaryId": 50961820843,
      "secondaryType": "LOCATION",
      "secondaryName": "TARGET, 1230 S LONGMORE, MESA, AZ 85202, UNITED STATES",
      "linkTypeName": "Property Recovered Location",
      "changeSet": [],
      "potentialAttributeIds": []
    },
    {
      "id": 55726639075,
      "timestampUtc": "2024-04-29T17:50:02.000Z",
      "changedBy": 35013475061,
      "historyEventType": "LINK_CREATION",
      "historyEventCategory": "CONTENT",
      "primaryId": 54288160600,
      "primaryType": "REPORTING_EVENT",
      "primaryName": "Event # 240008",
      "secondaryId": 55726639063,
      "secondaryType": "ITEM_PROFILE",
      "secondaryName": "",
      "changeSet": [],
      "potentialAttributeIds": []
    },
    {
      "id": 55726639072,
      "timestampUtc": "2024-04-29T17:50:02.000Z",
      "changedBy": 35013475061,
      "historyEventType": "ENTITY_CREATION",
      "historyEventCategory": "CONTENT",
      "primaryId": 55726639064,
      "primaryType": "ITEM_PROFILE",
      "primaryName": "fdf - Item ID 240008-3",
      "secondaryName": "",
      "changeSet": [],
      "directionalPrefix": "Property Status: Stolen (NIBRS)",
      "potentialAttributeIds": []
    },
    {
      "id": 55726639066,
      "timestampUtc": "2024-04-29T17:50:02.000Z",
      "changedBy": 35013475061,
      "historyEventType": "ENTITY_CREATION",
      "historyEventCategory": "CONTENT",
      "primaryId": 55726639064,
      "primaryType": "ITEM_PROFILE",
      "primaryName": "fdf - Item ID 240008-3",
      "secondaryName": "",
      "changeSet": [
        {
          "fieldName": "Description",
          "newValue": "fdf",
          "historyValueType": "STRING"
        }
      ],
      "potentialAttributeIds": []
    },
    {
      "id": 55726631590,
      "timestampUtc": "2024-04-29T17:49:42.000Z",
      "changedBy": 35013475061,
      "historyEventType": "LINK_CREATION",
      "historyEventCategory": "CONTENT",
      "primaryId": 55726631239,
      "primaryType": "ITEM_PROFILE",
      "primaryName": "dfdf - Item ID 240008-2",
      "secondaryId": 50961820843,
      "secondaryType": "LOCATION",
      "secondaryName": "TARGET, 1230 S LONGMORE, MESA, AZ 85202, UNITED STATES",
      "linkTypeName": "Property Recovered Location",
      "changeSet": [],
      "potentialAttributeIds": []
    },
    {
      "id": 55726631255,
      "timestampUtc": "2024-04-29T17:49:41.000Z",
      "changedBy": 35013475061,
      "historyEventType": "LINK_CREATION",
      "historyEventCategory": "CONTENT",
      "primaryId": 54288160600,
      "primaryType": "REPORTING_EVENT",
      "primaryName": "Event # 240008",
      "secondaryId": 55726631238,
      "secondaryType": "ITEM_PROFILE",
      "secondaryName": "",
      "changeSet": [],
      "potentialAttributeIds": []
    },
    {
      "id": 55726631250,
      "timestampUtc": "2024-04-29T17:49:41.000Z",
      "changedBy": 35013475061,
      "historyEventType": "ENTITY_CREATION",
      "historyEventCategory": "CONTENT",
      "primaryId": 55726631239,
      "primaryType": "ITEM_PROFILE",
      "primaryName": "dfdf - Item ID 240008-2",
      "secondaryName": "",
      "changeSet": [],
      "directionalPrefix": "Property Status: Stolen (NIBRS)",
      "potentialAttributeIds": []
    },
    {
      "id": 55726631241,
      "timestampUtc": "2024-04-29T17:49:41.000Z",
      "changedBy": 35013475061,
      "historyEventType": "ENTITY_CREATION",
      "historyEventCategory": "CONTENT",
      "primaryId": 55726631239,
      "primaryType": "ITEM_PROFILE",
      "primaryName": "dfdf - Item ID 240008-2",
      "secondaryName": "",
      "changeSet": [
        {
          "fieldName": "Description",
          "newValue": "dfdf",
          "historyValueType": "STRING"
        }
      ],
      "potentialAttributeIds": []
    },
    {
      "id": 55726604045,
      "timestampUtc": "2024-04-29T17:48:55.000Z",
      "changedBy": 35013475061,
      "historyEventType": "ENTITY_CREATION",
      "historyEventCategory": "CONTENT",
      "primaryId": 55725027154,
      "primaryType": "PERSON_PROFILE",
      "primaryName": "Jeff Smith",
      "secondaryName": "",
      "changeSet": [],
      "directionalPrefix": "Injury: Ankle, Left - Apparent Broken Bones",
      "potentialAttributeIds": []
    },
    {
      "id": 55726580317,
      "timestampUtc": "2024-04-29T17:48:23.000Z",
      "changedBy": 35013475061,
      "historyEventType": "REPORT_STATUS",
      "historyEventCategory": "WORKFLOW",
      "primaryId": 54713608189,
      "primaryType": "REPORT",
      "primaryName": "Report",
      "changeSet": [],
      "approvalStatus": "DRAFT",
      "clientApprovalStatus": "DRAFT",
      "potentialAttributeIds": []
    },
    {
      "id": 55726579826,
      "timestampUtc": "2024-04-29T17:48:20.000Z",
      "changedBy": 35013475061,
      "historyEventType": "LABEL_DELETION",
      "historyEventCategory": "WORKFLOW",
      "primaryId": 54713608189,
      "primaryType": "REPORT",
      "primaryName": "Event # 240008",
      "secondaryId": 35013434003,
      "secondaryName": "",
      "changeSet": [
        {
          "fieldName": "attributeId",
          "oldValue": 35013434003,
          "historyValueType": "ATTRIBUTE"
        }
      ],
      "potentialAttributeIds": []
    },
    {
      "id": 55726579825,
      "timestampUtc": "2024-04-29T17:48:20.000Z",
      "changedBy": 35013475061,
      "historyEventType": "LABEL_DELETION",
      "historyEventCategory": "WORKFLOW",
      "primaryId": 54713608189,
      "primaryType": "REPORT",
      "primaryName": "Event # 240008",
      "secondaryId": 54604892445,
      "secondaryName": "",
      "changeSet": [
        {
          "fieldName": "attributeId",
          "oldValue": 54604892445,
          "historyValueType": "ATTRIBUTE"
        }
      ],
      "potentialAttributeIds": []
    },
    {
      "id": 55726560125,
      "timestampUtc": "2024-04-29T17:47:46.000Z",
      "changedBy": 35013421476,
      "historyEventType": "LABEL_CREATION",
      "historyEventCategory": "WORKFLOW",
      "primaryId": 54713608189,
      "primaryType": "REPORT",
      "primaryName": "Event # 240008",
      "secondaryId": 35013434003,
      "secondaryName": "",
      "changeSet": [
        {
          "fieldName": "attributeId",
          "newValue": 35013434003,
          "historyValueType": "ATTRIBUTE"
        }
      ],
      "potentialAttributeIds": []
    },
    {
      "id": 55726560097,
      "timestampUtc": "2024-04-29T17:47:45.000Z",
      "changedBy": 35013421476,
      "historyEventType": "LABEL_CREATION",
      "historyEventCategory": "WORKFLOW",
      "primaryId": 54713608189,
      "primaryType": "REPORT",
      "primaryName": "Event # 240008",
      "secondaryId": 54604892445,
      "secondaryName": "",
      "changeSet": [
        {
          "fieldName": "attributeId",
          "newValue": 54604892445,
          "historyValueType": "ATTRIBUTE"
        }
      ],
      "potentialAttributeIds": []
    },
    {
      "id": 55726533749,
      "timestampUtc": "2024-04-29T17:46:59.000Z",
      "changedBy": 35013475061,
      "historyEventType": "REPORT_STATUS",
      "historyEventCategory": "WORKFLOW",
      "primaryId": 54713608189,
      "primaryType": "REPORT",
      "primaryName": "Report",
      "changeSet": [],
      "approvalStatus": "SUBMITTED",
      "clientApprovalStatus": "PENDING_SUPERVISOR_REVIEW",
      "potentialAttributeIds": []
    }
  ],
  "attributes": []
};

async function seedDetailedHistory() {
  try {
    console.log('Seeding detailed report history...');

    const response = await axios.post(`${API_BASE_URL}/ingest/report-history`, detailedHistoryPayload);

    console.log('\n✓ Report History seeded successfully');
    console.log(`  Total events in payload: ${detailedHistoryPayload.historyEvents.length}`);
    console.log(`  Events inserted: ${response.data.inserted}`);

  } catch (error) {
    console.error('Error seeding detailed history:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    process.exit(1);
  }
}

seedDetailedHistory();
