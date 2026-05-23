import { useEffect, useState } from "react";

const universityTierOptions = ["普通本科", "双一流 / 211", "985 / 重点院校", "其他背景"];
const gradeOptions = ["大三", "大四", "毕业备考"];
const crossExamOptions = ["否", "是"];
const targetOptions = [
  "市场营销 / 数字营销（科目待核验）",
  "工商管理 / 企业管理（示例含数学）",
  "应用经济 / 国际商务（示例含数学）",
  "尚未确定",
];
const regionOptions = ["华东地区", "华南地区", "华中地区", "不限地区"];
const degreeOptions = ["学硕优先", "专硕优先", "尚未决定"];
const adjustmentOptions = ["接受调剂", "视情况考虑", "不接受调剂"];
const levelOptions = ["基础薄弱", "中等", "较扎实"];
const riskOptions = ["冲刺优先", "稳妥优先", "上岸优先"];
const concernOptions = ["择校", "资料", "计划", "执行", "焦虑", "真题", "复试", "其他"];

const initialShape = {
  universityTier: "",
  major: "",
  grade: "",
  isCrossExam: "",
  targetDirection: "",
  region: "",
  degreePreference: "",
  acceptsAdjustment: "",
  riskPreference: "",
  englishLevel: "",
  mathLevel: "",
  professionalLevel: "",
  weeklyHours: "",
  monthsRemaining: "",
  biggestConcern: "",
  notes: "",
};

const requiredLabels = {
  universityTier: "请选择本科院校层次",
  major: "请输入本科专业",
  grade: "请选择当前年级",
  isCrossExam: "请选择是否跨考",
  targetDirection: "请选择目标专业方向",
  region: "请选择目标地区",
  degreePreference: "请选择学硕/专硕偏好",
  acceptsAdjustment: "请选择是否接受调剂",
  riskPreference: "请选择风险偏好",
  englishLevel: "请选择英语基础",
  mathLevel: "请选择数学基础",
  professionalLevel: "请选择专业课基础",
  weeklyHours: "请输入每周可学习时长",
  monthsRemaining: "请输入距离考试剩余时间",
  biggestConcern: "请选择当前最大困扰",
};

function buildFormValues(values) {
  const nextValues = { ...initialShape, ...values };

  if (!riskOptions.includes(nextValues.riskPreference)) {
    nextValues.riskPreference = "";
  }
  if (!levelOptions.includes(nextValues.mathLevel)) {
    nextValues.mathLevel = "";
  }

  return nextValues;
}

function FormSection({ index, title, description, children }) {
  return (
    <section className="profile-section">
      <div className="profile-section-header">
        <span className="profile-section-number">{index}</span>
        <div>
          <h2 className="text-base font-bold text-slate-950">{title}</h2>
          <p className="mt-1 text-xs leading-6 text-slate-500">{description}</p>
        </div>
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function FieldError({ message }) {
  return message ? <p className="field-error">{message}</p> : null;
}

export default function ProfileForm({ initialValues, onSubmit }) {
  const [form, setForm] = useState(() => buildFormValues(initialValues));
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm(buildFormValues(initialValues));
    setErrors({});
  }, [initialValues]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => {
      if (!current[name]) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });
  }

  function validate() {
    const nextErrors = Object.entries(requiredLabels).reduce((result, [field, message]) => {
      if (!String(form[field] ?? "").trim()) result[field] = message;
      return result;
    }, {});

    if (form.weeklyHours && Number(form.weeklyHours) < 1) {
      nextErrors.weeklyHours = "每周学习时长需大于 0 小时";
    }
    if (form.monthsRemaining && Number(form.monthsRemaining) < 1) {
      nextErrors.monthsRemaining = "剩余时间需至少为 1 个月";
    }

    return nextErrors;
  }

  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validate();

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    onSubmit(form);
  }

  return (
    <form className="space-y-5" noValidate onSubmit={handleSubmit}>
      <FormSection
        description="了解你的学习起点，帮助识别跨考与背景适配风险。"
        index="01"
        title="基础背景"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="field-label">
            本科院校层次 <span className="required-mark">*</span>
            <select
              aria-invalid={Boolean(errors.universityTier)}
              className="field-input"
              name="universityTier"
              onChange={updateField}
              value={form.universityTier}
            >
              <option value="">请选择院校层次</option>
              {universityTierOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
            <FieldError message={errors.universityTier} />
          </label>
          <label className="field-label">
            本科专业 <span className="required-mark">*</span>
            <input
              aria-invalid={Boolean(errors.major)}
              className="field-input"
              name="major"
              onChange={updateField}
              placeholder="例如：市场营销"
              value={form.major}
            />
            <FieldError message={errors.major} />
          </label>
          <label className="field-label">
            当前年级 <span className="required-mark">*</span>
            <select
              aria-invalid={Boolean(errors.grade)}
              className="field-input"
              name="grade"
              onChange={updateField}
              value={form.grade}
            >
              <option value="">请选择当前阶段</option>
              {gradeOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
            <FieldError message={errors.grade} />
          </label>
          <fieldset>
            <legend className="field-label">
              是否跨考 <span className="required-mark">*</span>
            </legend>
            <div className="mt-2 grid grid-cols-2 gap-3">
              {crossExamOptions.map((option) => (
                <label className="choice-card" key={option}>
                  <input
                    checked={form.isCrossExam === option}
                    className="accent-indigo-600"
                    name="isCrossExam"
                    onChange={updateField}
                    type="radio"
                    value={option}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
            <FieldError message={errors.isCrossExam} />
          </fieldset>
        </div>
      </FormSection>

      <FormSection
        description="明确目标选择策略，报告将据此形成定位建议。"
        index="02"
        title="目标意向"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="field-label">
            目标专业方向 <span className="required-mark">*</span>
            <select
              aria-invalid={Boolean(errors.targetDirection)}
              className="field-input"
              name="targetDirection"
              onChange={updateField}
              value={form.targetDirection}
            >
              <option value="">请选择目标方向</option>
              {targetOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
            <FieldError message={errors.targetDirection} />
          </label>
          <label className="field-label">
            目标地区 <span className="required-mark">*</span>
            <select
              aria-invalid={Boolean(errors.region)}
              className="field-input"
              name="region"
              onChange={updateField}
              value={form.region}
            >
              <option value="">请选择目标地区</option>
              {regionOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
            <FieldError message={errors.region} />
          </label>
          <label className="field-label">
            学硕/专硕偏好 <span className="required-mark">*</span>
            <select
              aria-invalid={Boolean(errors.degreePreference)}
              className="field-input"
              name="degreePreference"
              onChange={updateField}
              value={form.degreePreference}
            >
              <option value="">请选择培养类型偏好</option>
              {degreeOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
            <FieldError message={errors.degreePreference} />
          </label>
          <label className="field-label">
            是否接受调剂 <span className="required-mark">*</span>
            <select
              aria-invalid={Boolean(errors.acceptsAdjustment)}
              className="field-input"
              name="acceptsAdjustment"
              onChange={updateField}
              value={form.acceptsAdjustment}
            >
              <option value="">请选择调剂态度</option>
              {adjustmentOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
            <FieldError message={errors.acceptsAdjustment} />
          </label>
        </div>
        <fieldset className="mt-6">
          <legend className="field-label">
            风险偏好 <span className="required-mark">*</span>
          </legend>
          <div className="mt-2 grid gap-3 sm:grid-cols-3">
            {riskOptions.map((option) => (
              <label className="choice-card" key={option}>
                <input
                  checked={form.riskPreference === option}
                  className="accent-indigo-600"
                  name="riskPreference"
                  onChange={updateField}
                  type="radio"
                  value={option}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
          <FieldError message={errors.riskPreference} />
        </fieldset>
      </FormSection>

      <FormSection
        description="评估当前能力和可投入时间，让计划建议更贴近现实。"
        index="03"
        title="备考基础"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="field-label">
            英语基础 <span className="required-mark">*</span>
            <select
              aria-invalid={Boolean(errors.englishLevel)}
              className="field-input"
              name="englishLevel"
              onChange={updateField}
              value={form.englishLevel}
            >
              <option value="">请选择英语基础</option>
              {levelOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
            <FieldError message={errors.englishLevel} />
          </label>
          <label className="field-label">
            数学基础 <span className="required-mark">*</span>
            <select
              aria-invalid={Boolean(errors.mathLevel)}
              className="field-input"
              name="mathLevel"
              onChange={updateField}
              value={form.mathLevel}
            >
              <option value="">请选择数学基础</option>
              {levelOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
            <FieldError message={errors.mathLevel} />
          </label>
          <label className="field-label">
            专业课基础 <span className="required-mark">*</span>
            <select
              aria-invalid={Boolean(errors.professionalLevel)}
              className="field-input"
              name="professionalLevel"
              onChange={updateField}
              value={form.professionalLevel}
            >
              <option value="">请选择专业课基础</option>
              {levelOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
            <FieldError message={errors.professionalLevel} />
          </label>
          <label className="field-label">
            每周可学习时长 <span className="required-mark">*</span>
            <span className="field-suffix-wrap">
              <input
                aria-invalid={Boolean(errors.weeklyHours)}
                className="field-input pr-14"
                min="1"
                name="weeklyHours"
                onChange={updateField}
                placeholder="例如：20"
                type="number"
                value={form.weeklyHours}
              />
              <span className="field-suffix">小时</span>
            </span>
            <FieldError message={errors.weeklyHours} />
          </label>
          <label className="field-label sm:col-span-2">
            距离考试剩余时间 <span className="required-mark">*</span>
            <span className="field-suffix-wrap sm:max-w-[calc(50%_-_0.625rem)]">
              <input
                aria-invalid={Boolean(errors.monthsRemaining)}
                className="field-input pr-14"
                min="1"
                name="monthsRemaining"
                onChange={updateField}
                placeholder="例如：7"
                type="number"
                value={form.monthsRemaining}
              />
              <span className="field-suffix">个月</span>
            </span>
            <FieldError message={errors.monthsRemaining} />
          </label>
        </div>
      </FormSection>

      <FormSection
        description="告诉 Agent 你最需要被解决的问题，建议会更有针对性。"
        index="04"
        title="当前困扰"
      >
        <fieldset>
          <legend className="field-label">
            最大困扰 <span className="required-mark">*</span>
          </legend>
          <div className="mt-3 flex flex-wrap gap-3">
            {concernOptions.map((option) => (
              <label className="concern-pill" key={option}>
                <input
                  checked={form.biggestConcern === option}
                  className="sr-only"
                  name="biggestConcern"
                  onChange={updateField}
                  type="radio"
                  value={option}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
          <FieldError message={errors.biggestConcern} />
        </fieldset>
        <label className="field-label mt-6">
          补充说明
          <textarea
            className="field-input min-h-28 resize-y"
            maxLength="240"
            name="notes"
            onChange={updateField}
            placeholder="例如：目前正在实习，数学进度偏慢，希望先确定更稳妥的目标范围。"
            value={form.notes}
          />
          <span className="mt-2 block text-xs font-normal text-slate-400">
            选填，最多 240 字。演示版内容仅保留在本地浏览器中。
          </span>
        </label>
      </FormSection>

      {Object.keys(errors).length > 0 && (
        <p className="form-alert" role="alert">
          请补充标记为必填的画像信息后，再生成定位报告。
        </p>
      )}
      <div className="surface-card flex flex-col justify-between gap-5 p-6 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold text-slate-900">准备好生成诊断结果了吗？</p>
          <p className="mt-1 text-xs leading-6 text-slate-500">
            提交后将进入择校定位报告，并可继续生成学习计划。
          </p>
        </div>
        <button className="button-primary shrink-0 px-7 py-3.5" type="submit">
          生成我的考研定位报告
          <span aria-hidden="true" className="ml-2">
            →
          </span>
        </button>
      </div>
    </form>
  );
}
