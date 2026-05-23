import { useEffect, useState } from "react";

const regionOptions = ["华东地区", "华南地区", "华中地区", "不限地区"];
const degreeOptions = ["学硕优先", "专硕优先", "尚未决定"];
const levelOptions = ["基础薄弱", "中等", "较扎实"];
const riskOptions = ["稳妥优先", "均衡选择", "冲刺名校"];

export default function ProfileForm({ initialValues, onSubmit }) {
  const [form, setForm] = useState(initialValues);

  useEffect(() => {
    setForm(initialValues);
  }, [initialValues]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit(form);
  }

  return (
    <form className="surface-card space-y-6 p-6 md:p-8" onSubmit={handleSubmit}>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="field-label">
          本科专业
          <input
            className="field-input"
            name="major"
            onChange={updateField}
            required
            value={form.major}
          />
        </label>
        <label className="field-label">
          意向区域
          <select
            className="field-input"
            name="region"
            onChange={updateField}
            value={form.region}
          >
            {regionOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
        <label className="field-label">
          学位倾向
          <select
            className="field-input"
            name="degreePreference"
            onChange={updateField}
            value={form.degreePreference}
          >
            {degreeOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
        <label className="field-label">
          每周可投入时间
          <input
            className="field-input"
            min="4"
            name="weeklyHours"
            onChange={updateField}
            type="number"
            value={form.weeklyHours}
          />
        </label>
        <label className="field-label">
          英语基础
          <select
            className="field-input"
            name="englishLevel"
            onChange={updateField}
            value={form.englishLevel}
          >
            {levelOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
        <label className="field-label">
          数学/综合能力基础
          <select
            className="field-input"
            name="mathLevel"
            onChange={updateField}
            value={form.mathLevel}
          >
            {levelOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
      </div>
      <fieldset>
        <legend className="field-label mb-3">目标风险偏好</legend>
        <div className="grid gap-3 sm:grid-cols-3">
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
      </fieldset>
      <button className="button-primary w-full sm:w-auto" type="submit">
        生成我的画像报告
      </button>
    </form>
  );
}
