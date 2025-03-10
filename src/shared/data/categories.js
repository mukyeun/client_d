// 기존 데이터 파일들에서 카테고리 데이터 가져오기
export const 증상카테고리 = {
  "두경부": {
    "두통": [
      { name: "편두통(G43.9)" },
      // ... 기존 데이터 유지
    ],
    // ... 다른 두경부 카테고리 유지
  },
  // ... 다른 대분류 카테고리 유지
};

export const 약물카테고리 = [
    "없음",
    "소염진통제",
    "항생제",
    "스테로이드제",
    "고혈압치료제",
    "혈당조절제",
    "신경안정제",
    "수면제",
    "항우울제",
    "갑상선치료제",
    "위장약",
    "항히스타민제",
    "천식치료제",
    "골다공증치료제",
    "항응고제",
    "고지혈증치료제",
    "전립선치료제",
    "항경련제",
    "항구토제",
    "진해거담제",
    "관절염치료제"
];

export const 기호식품카테고리 = [
    "없음",
    "술",
    "담배",
    "커피",
    "과자",
    "마약",
    "기타"
];

export const 스트레스카테고리 = [
  {
    대분류: "개인적 사건",
    중분류: [
      { name: "배우자 사망", score: 100 },
      { name: "이혼", score: 73 },
      { name: "별거", score: 65 },
      { name: "가까운 가족 구성원의 사망", score: 63 },
      { name: "개인적 부상이나 질병", score: 53 }
    ]
  },
  // ... 다른 스트레스 카테고리 유지
];

export const evaluateStressLevel = (totalScore) => {
  if (totalScore <= 150) {
    return {
      level: "낮음",
      description: "질병 발생 가능성이 낮음"
    };
  } else if (totalScore <= 299) {
    return {
      level: "중간",
      description: "질병 위험이 약간 증가"
    };
  } else {
    return {
      level: "높음",
      description: "질병 발생 가능성이 크게 증가"
    };
  }
};

// 증상 매핑 유틸리티
const 증상매핑 = {};
Object.entries(증상카테고리).forEach(([대분류, 중분류객체]) => {
  Object.entries(중분류객체).forEach(([중분류, 증상배열]) => {
    증상매핑[중분류] = 증상배열.map(증상 => 
      typeof 증상 === 'object' ? 증상.name : 증상
    );
  });
});

export { 증상매핑 as 증상 }; 