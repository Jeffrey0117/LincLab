// 測試檔案：驗證 Google Sheets 設定頁面的功能
// 此檔案僅用於展示頁面功能結構

import React from 'react';

// 功能摘要：
// 1. Apps Script 設定教學卡片已新增
// 2. 使用 Collapsible 組件實現收合功能
// 3. localStorage key: 'googleSheetsTutorialOpen' 記錄展開狀態
// 4. 包含完整的 Apps Script 範例程式碼
// 5. 提供一鍵複製程式碼功能
// 6. 詳細的設定步驟說明（4步驟）

const PageStructure = {
  components: {
    tutorial: {
      title: "Apps Script 設定教學",
      icon: "BookOpen",
      position: "在基本設定卡片之前",
      defaultState: "收合",
      localStorage: "googleSheetsTutorialOpen"
    },
    features: [
      "可收合的教學卡片",
      "Apps Script 程式碼範例",
      "複製按鈕功能",
      "4個清楚的設定步驟",
      "常見問題說明",
      "外部文件連結"
    ],
    codeExample: {
      functions: ["doPost", "doGet"],
      dataFields: [
        "timestamp",
        "title",
        "imageUrl",
        "affiliateUrl",
        "platform",
        "category",
        "originalUrl"
      ]
    }
  },
  userFlow: {
    step1: "開啟 Google Sheet → 擴充功能 → Apps Script",
    step2: "貼上提供的接收資料程式碼",
    step3: "部署為 Web App（設定為任何人可執行）",
    step4: "複製部署 URL 貼回設定頁面"
  }
};

export default PageStructure;