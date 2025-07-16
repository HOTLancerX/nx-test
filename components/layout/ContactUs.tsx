// components/layout/ContactUs.tsx
import { useState } from "react";
import dynamic from "next/dynamic";
import "suneditor/dist/css/suneditor.min.css"

const SunEditor = dynamic(() => import("suneditor-react"), {
  ssr: false,
});

interface ContactUsProps {
  title: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  fields: Array<{
    type: string;
    label: string;
    placeholder: string;
    required: boolean;
    options?: string;
    desktopW: string;
    mobileW: string;
  }>;
  onSubmit: (formData: Record<string, any>) => Promise<void>;
}

export default function ContactUs({
  title,
  description,
  email,
  phone,
  address,
  fields,
  onSubmit,
}: ContactUsProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleChange = (fieldName: string, value: any) => {
    setFormData({
      ...formData,
      [fieldName]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      await onSubmit(formData);
      setSubmitMessage({
        type: "success",
        message: "Thank you for your submission! We'll get back to you soon.",
      });
      setFormData({});
    } catch (error) {
      setSubmitMessage({
        type: "error",
        message: "There was an error submitting your form. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (
    field: ContactUsProps["fields"][0],
    index: number
  ) => {
    const fieldName = `field_${index}`;
    const fieldValue = formData[fieldName] || "";

    switch (field.type) {
      case "textarea":
        return (
          <textarea
            id={fieldName}
            name={fieldName}
            placeholder={field.placeholder}
            required={field.required}
            value={fieldValue}
            onChange={(e) => handleChange(fieldName, e.target.value)}
            className={`${field.mobileW} ${field.desktopW} px-3 py-2 border border-gray-300 rounded-md`}
            rows={4}
          />
        );
      case "radio":
      case "checkbox":
        if (!field.options) return null;
        const options = field.options
          .split("\n")
          .filter((line) => line.trim())
          .map((line) => {
            const [label, value] = line.split("|").map((part) => part.trim());
            return { label, value: value || label };
          });

        return (
          <div className={`${field.mobileW} ${field.desktopW} space-y-2`}>
            {options.map((option, i) => (
              <div key={i} className="flex items-center">
                <input
                  type={field.type}
                  id={`${fieldName}_${i}`}
                  name={fieldName}
                  value={option.value}
                  checked={
                    field.type === "checkbox"
                      ? Array.isArray(fieldValue)
                        ? fieldValue.includes(option.value)
                        : false
                      : fieldValue === option.value
                  }
                  onChange={(e) => {
                    if (field.type === "checkbox") {
                      const newValue = Array.isArray(fieldValue)
                        ? e.target.checked
                          ? [...fieldValue, option.value]
                          : fieldValue.filter((v) => v !== option.value)
                        : e.target.checked
                        ? [option.value]
                        : [];
                      handleChange(fieldName, newValue);
                    } else {
                      handleChange(fieldName, option.value);
                    }
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor={`${fieldName}_${i}`}
                  className="ml-2 block text-sm text-gray-700"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        );
      case "select":
        if (!field.options) return null;
        const selectOptions = field.options
          .split("\n")
          .filter((line) => line.trim())
          .map((line) => {
            const [label, value] = line.split("|").map((part) => part.trim());
            return { label, value: value || label };
          });

        return (
          <select
            id={fieldName}
            name={fieldName}
            value={fieldValue}
            onChange={(e) => handleChange(fieldName, e.target.value)}
            className={`${field.mobileW} ${field.desktopW} px-3 py-2 border border-gray-300 rounded-md`}
            required={field.required}
          >
            <option value="">Select an option</option>
            {selectOptions.map((option, i) => (
              <option key={i} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      case "html":
        return (
          <div
            className={`${field.mobileW} ${field.desktopW}`}
            dangerouslySetInnerHTML={{ __html: fieldValue }}
          />
        );
      default:
        return (
          <input
            type={field.type}
            id={fieldName}
            name={fieldName}
            placeholder={field.placeholder}
            required={field.required}
            value={fieldValue}
            onChange={(e) => handleChange(fieldName, e.target.value)}
            className={`${field.mobileW} ${field.desktopW} px-3 py-2 border border-gray-300 rounded-md`}
          />
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Email</h3>
              <p className="text-base text-gray-900">{email}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Phone</h3>
              <p className="text-base text-gray-900">{phone}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Address</h3>
              <p className="text-base text-gray-900 whitespace-pre-line">
                {address}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {submitMessage && (
              <div
                className={`p-4 rounded-md ${
                  submitMessage.type === "success"
                    ? "bg-green-50 text-green-800"
                    : "bg-red-50 text-red-800"
                }`}
              >
                {submitMessage.message}
              </div>
            )}

            {fields.map((field, index) => (
              <div key={index} className="space-y-1">
                <label
                  htmlFor={`field_${index}`}
                  className="block text-sm font-medium text-gray-700"
                >
                  {field.label}
                  {field.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
                {renderField(field, index)}
              </div>
            ))}

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}