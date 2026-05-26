import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const source211 =
  "https://www.moe.gov.cn/srcsite/A22/s7065/200512/t20051223_82762.html";
const source985 =
  "https://www.moe.gov.cn/srcsite/A22/s7065/200612/t20061206_128833.html";
const disclaimer = "正式信息以研招网和目标院校研究生招生官网为准。";
const majorDataDisclaimer =
  "当前院校基础索引不包含完整专业目录、招生人数、复试线或参考书，具体信息以研招网和目标院校研究生招生官网为准。";
const notes =
  "基础索引用于择校初筛；具体招生专业、考试科目、招生人数、复试线以研招网和目标院校研究生招生官网为准。";
const coreCandidateMajorAreas = [
  "工商管理",
  "应用经济学",
  "管理科学与工程",
];
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const schoolKnowledgePath = resolve(projectRoot, "src/data/schools.json");
const schoolKnowledge = JSON.parse(readFileSync(schoolKnowledgePath, "utf8")).schools ?? [];

// Name membership is aligned with the Ministry of Education's historical
// 211/985 project lists. Locations and category tags are navigation metadata
// for initial retrieval and remain partial until audited school by school.
const official211Index = [
  ["北京大学", "北京市", "北京市", "综合类"],
  ["中国人民大学", "北京市", "北京市", "综合类"],
  ["清华大学", "北京市", "北京市", "综合类"],
  ["北京交通大学", "北京市", "北京市", "理工类"],
  ["北京工业大学", "北京市", "北京市", "理工类"],
  ["北京航空航天大学", "北京市", "北京市", "理工类"],
  ["北京理工大学", "北京市", "北京市", "理工类"],
  ["北京科技大学", "北京市", "北京市", "理工类"],
  ["北京化工大学", "北京市", "北京市", "理工类"],
  ["北京邮电大学", "北京市", "北京市", "理工类"],
  ["中国农业大学", "北京市", "北京市", "农林类"],
  ["北京林业大学", "北京市", "北京市", "农林类"],
  ["北京中医药大学", "北京市", "北京市", "医药类"],
  ["北京师范大学", "北京市", "北京市", "师范类"],
  ["北京外国语大学", "北京市", "北京市", "其他"],
  ["中国传媒大学", "北京市", "北京市", "其他", ["新闻传播", "数字营销"]],
  ["中央财经大学", "北京市", "北京市", "财经类"],
  ["对外经济贸易大学", "北京市", "北京市", "财经类"],
  ["北京体育大学", "北京市", "北京市", "其他"],
  ["中央音乐学院", "北京市", "北京市", "艺术类"],
  ["中央民族大学", "北京市", "北京市", "民族类"],
  ["中国政法大学", "北京市", "北京市", "政法类"],
  ["华北电力大学", "多地办学，待核验", "多地办学，待核验", "理工类", ["北京", "保定", "多地办学"]],
  ["南开大学", "天津市", "天津市", "综合类"],
  ["天津大学", "天津市", "天津市", "理工类"],
  ["天津医科大学", "天津市", "天津市", "医药类"],
  ["河北工业大学", "天津市", "天津市", "理工类", ["河北"]],
  ["太原理工大学", "山西省", "太原市", "理工类"],
  ["内蒙古大学", "内蒙古自治区", "呼和浩特市", "综合类"],
  ["辽宁大学", "辽宁省", "沈阳市", "综合类"],
  ["大连理工大学", "辽宁省", "大连市", "理工类"],
  ["东北大学", "辽宁省", "沈阳市", "理工类"],
  ["大连海事大学", "辽宁省", "大连市", "理工类"],
  ["吉林大学", "吉林省", "长春市", "综合类"],
  ["延边大学", "吉林省", "延吉市", "综合类"],
  ["东北师范大学", "吉林省", "长春市", "师范类"],
  ["哈尔滨工业大学", "黑龙江省", "哈尔滨市", "理工类"],
  ["哈尔滨工程大学", "黑龙江省", "哈尔滨市", "理工类"],
  ["东北农业大学", "黑龙江省", "哈尔滨市", "农林类"],
  ["东北林业大学", "黑龙江省", "哈尔滨市", "农林类"],
  ["复旦大学", "上海市", "上海市", "综合类"],
  ["同济大学", "上海市", "上海市", "理工类"],
  ["上海交通大学", "上海市", "上海市", "综合类"],
  ["华东理工大学", "上海市", "上海市", "理工类"],
  ["东华大学", "上海市", "上海市", "理工类"],
  ["华东师范大学", "上海市", "上海市", "师范类"],
  ["上海外国语大学", "上海市", "上海市", "其他"],
  ["上海财经大学", "上海市", "上海市", "财经类"],
  ["上海大学", "上海市", "上海市", "综合类"],
  ["第二军医大学", "上海市", "上海市", "医药类", ["海军军医大学", "现行名称待核验"]],
  ["南京大学", "江苏省", "南京市", "综合类"],
  ["苏州大学", "江苏省", "苏州市", "综合类"],
  ["东南大学", "江苏省", "南京市", "综合类"],
  ["南京航空航天大学", "江苏省", "南京市", "理工类"],
  ["南京理工大学", "江苏省", "南京市", "理工类"],
  ["中国矿业大学", "多地办学，待核验", "多地办学，待核验", "理工类", ["徐州", "北京", "多地办学"]],
  ["河海大学", "江苏省", "南京市", "理工类"],
  ["江南大学", "江苏省", "无锡市", "综合类"],
  ["南京农业大学", "江苏省", "南京市", "农林类"],
  ["中国药科大学", "江苏省", "南京市", "医药类"],
  ["南京师范大学", "江苏省", "南京市", "师范类"],
  ["浙江大学", "浙江省", "杭州市", "综合类"],
  ["安徽大学", "安徽省", "合肥市", "综合类"],
  ["中国科学技术大学", "安徽省", "合肥市", "理工类"],
  ["合肥工业大学", "安徽省", "合肥市", "理工类"],
  ["厦门大学", "福建省", "厦门市", "综合类"],
  ["福州大学", "福建省", "福州市", "理工类"],
  ["南昌大学", "江西省", "南昌市", "综合类"],
  ["山东大学", "山东省", "济南市", "综合类"],
  ["中国海洋大学", "山东省", "青岛市", "综合类"],
  ["中国石油大学", "多地办学，待核验", "多地办学，待核验", "理工类", ["北京", "青岛", "东营", "多地办学"]],
  ["郑州大学", "河南省", "郑州市", "综合类"],
  ["武汉大学", "湖北省", "武汉市", "综合类"],
  ["华中科技大学", "湖北省", "武汉市", "综合类"],
  ["中国地质大学", "多地办学，待核验", "多地办学，待核验", "理工类", ["武汉", "北京", "多地办学"]],
  ["武汉理工大学", "湖北省", "武汉市", "理工类"],
  ["华中农业大学", "湖北省", "武汉市", "农林类"],
  ["华中师范大学", "湖北省", "武汉市", "师范类"],
  ["中南财经政法大学", "湖北省", "武汉市", "财经类", ["政法类"]],
  ["湖南大学", "湖南省", "长沙市", "综合类"],
  ["中南大学", "湖南省", "长沙市", "综合类"],
  ["湖南师范大学", "湖南省", "长沙市", "师范类"],
  ["国防科学技术大学", "湖南省", "长沙市", "理工类", ["国防科技大学", "现行名称待核验"]],
  ["中山大学", "广东省", "广州市", "综合类"],
  ["暨南大学", "广东省", "广州市", "综合类"],
  ["华南理工大学", "广东省", "广州市", "理工类"],
  ["华南师范大学", "广东省", "广州市", "师范类"],
  ["广西大学", "广西壮族自治区", "南宁市", "综合类"],
  ["海南大学", "海南省", "海口市", "综合类"],
  ["四川大学", "四川省", "成都市", "综合类"],
  ["西南交通大学", "四川省", "成都市", "理工类"],
  ["电子科技大学", "四川省", "成都市", "理工类"],
  ["四川农业大学", "四川省", "多地办学，待核验", "农林类", ["雅安", "成都", "多地办学"]],
  ["西南财经大学", "四川省", "成都市", "财经类"],
  ["重庆大学", "重庆市", "重庆市", "综合类"],
  ["西南大学", "重庆市", "重庆市", "综合类"],
  ["贵州大学", "贵州省", "贵阳市", "综合类"],
  ["云南大学", "云南省", "昆明市", "综合类"],
  ["西藏大学", "西藏自治区", "拉萨市", "综合类"],
  ["西北大学", "陕西省", "西安市", "综合类"],
  ["西安交通大学", "陕西省", "西安市", "综合类"],
  ["西北工业大学", "陕西省", "西安市", "理工类"],
  ["西安电子科技大学", "陕西省", "西安市", "理工类"],
  ["长安大学", "陕西省", "西安市", "理工类"],
  ["西北农林科技大学", "陕西省", "咸阳市", "农林类"],
  ["陕西师范大学", "陕西省", "西安市", "师范类"],
  ["第四军医大学", "陕西省", "西安市", "医药类", ["空军军医大学", "现行名称待核验"]],
  ["兰州大学", "甘肃省", "兰州市", "综合类"],
  ["青海大学", "青海省", "西宁市", "综合类"],
  ["宁夏大学", "宁夏回族自治区", "银川市", "综合类"],
  ["新疆大学", "新疆维吾尔自治区", "乌鲁木齐市", "综合类"],
  ["石河子大学", "新疆维吾尔自治区", "石河子市", "综合类"],
];

const official985Names = new Set([
  "北京大学",
  "中国人民大学",
  "清华大学",
  "北京航空航天大学",
  "北京理工大学",
  "中国农业大学",
  "北京师范大学",
  "中央民族大学",
  "南开大学",
  "天津大学",
  "大连理工大学",
  "东北大学",
  "吉林大学",
  "哈尔滨工业大学",
  "复旦大学",
  "同济大学",
  "上海交通大学",
  "华东师范大学",
  "南京大学",
  "东南大学",
  "浙江大学",
  "中国科学技术大学",
  "厦门大学",
  "山东大学",
  "中国海洋大学",
  "武汉大学",
  "华中科技大学",
  "湖南大学",
  "中南大学",
  "国防科学技术大学",
  "中山大学",
  "华南理工大学",
  "四川大学",
  "电子科技大学",
  "重庆大学",
  "西安交通大学",
  "西北工业大学",
  "西北农林科技大学",
  "兰州大学",
]);

function relatedFieldsFor(school, type) {
  if (type === "财经类") {
    return ["经管类初筛", "应用经济待核验", "工商管理待核验", "数字营销方向待核验"];
  }
  if (school === "中国传媒大学") {
    return ["新闻传播初筛", "数字营销方向待核验", "经管类招生设置待核验"];
  }
  return ["经管类招生设置待核验"];
}

function findRelatedMajors(universityId, school) {
  return schoolKnowledge.filter(
    (major) => major.universityId === universityId || major.school === school,
  );
}

function candidateMajorAreaNamesFor(school, type) {
  const extraAreas =
    type === "财经类"
      ? ["会计", "金融", "市场营销", "数字营销", "公共管理", "国际商务"]
      : school === "中国传媒大学"
        ? ["新闻传播", "数字营销", "市场营销"]
        : [];

  return [...new Set([...coreCandidateMajorAreas, ...extraAreas])];
}

function buildCandidateMajorAreas(school, type, relatedMajors) {
  return candidateMajorAreaNamesFor(school, type).map((area) => {
    const relatedSchoolMajorIds = relatedMajors
      .filter(
        (major) =>
          major.major?.includes(area) || major.researchDirection?.includes(area),
      )
      .map((major) => major.id);

    return {
      area,
      status: relatedSchoolMajorIds.length ? "linked" : "candidate",
      note: "仅表示可作为后续核验方向，不代表该校当年招生。",
      relatedSchoolMajorIds,
    };
  });
}

const universities = official211Index.map(
  ([school, province, city, type, additionalKeywords = []], index) => {
    const id = `univ_${String(index + 1).padStart(3, "0")}`;
    const is985 = official985Names.has(school);
    const relatedMajors = findRelatedMajors(id, school);
    const linkedSchoolMajorIds = relatedMajors.map((major) => major.id);
    return {
      id,
      school,
      province,
      city,
      is985,
      is211: true,
      isDoubleFirstClass: "待核验",
      schoolType: [type],
      supervisingDepartment: "待核验",
      officialWebsite: "待核验",
      graduateAdmissionWebsite: "待核验",
      graduateSchoolWebsite: "待核验",
      relatedFields: relatedFieldsFor(school, type),
      hasMajorKnowledge: linkedSchoolMajorIds.length > 0,
      linkedSchoolMajorIds,
      candidateMajorAreas: buildCandidateMajorAreas(school, type, relatedMajors),
      majorDataStatus: linkedSchoolMajorIds.length ? "linked" : "none",
      majorDataDisclaimer,
      searchKeywords: [
        school,
        province,
        city,
        province.replace(/(省|市|自治区|壮族自治区|回族自治区|维吾尔自治区)$/u, ""),
        city.replace(/市$/u, ""),
        type,
        is985 ? "985" : "非985",
        "211",
        "经管",
        "考研",
        ...additionalKeywords,
      ],
      dataStatus: "partial",
      verifiedFields: ["school", "is985", "is211"],
      source: {
        sourceName: "教育部公开工程名单",
        sourceType: "official_index",
        sourceUrl: is985 ? `${source211}; ${source985}` : source211,
        checkedAt: "2026-05-26",
        reliability: "high",
      },
      notes,
      disclaimer,
    };
  },
);

if (universities.length !== 112) {
  throw new Error(`Expected 112 unique 211 records, found ${universities.length}.`);
}
if (new Set(universities.map((item) => item.school)).size !== universities.length) {
  throw new Error("University names must be unique.");
}
if (universities.filter((item) => item.is985).length !== 39) {
  throw new Error("Expected 39 universities tagged as 985.");
}

const data = {
  knowledgeBase: {
    name: "985 / 211 院校基础索引库",
    version: "0.2.0",
    scope:
      "用于学校层级初筛、工程名单身份查询及与专业知识记录的关联状态展示；不自行提供专业目录、考试科目、招生人数、复试线或参考书结论。",
    checkedAt: "2026-05-26",
    coverage: {
      uniqueUniversities: universities.length,
      universities985: universities.filter((item) => item.is985).length,
      universities211: universities.filter((item) => item.is211).length,
      identityBasis: "教育部公开的历史 211工程 / 985工程学校名单口径",
    },
    sourceDocuments: [
      {
        title: "211工程学校名单",
        publisher: "中华人民共和国教育部",
        url: source211,
        checkedAt: "2026-05-26",
      },
      {
        title: "985工程学校名单",
        publisher: "中华人民共和国教育部",
        url: source985,
        checkedAt: "2026-05-26",
      },
    ],
    fieldPolicy:
      "学校名称及 985/211 身份已按教育部名单核对；candidateMajorAreas 仅为后续核验候选，不表示当年招生；城市、类型、官网、主管部门、双一流状态与研究生招生信息仍需逐校人工复核。",
  },
  disclaimer,
  majorDataDisclaimer,
  universities,
};

const outputPath = resolve(projectRoot, "src/data/universities.json");
mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
console.log(
  `Generated ${universities.length} university records (${universities.filter((item) => item.is985).length} tagged 985, ${universities.filter((item) => item.is211).length} tagged 211).`,
);
