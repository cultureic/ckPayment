import React, { useState } from 'react';
import './index.css';




  const Stepper = ({ steps, currentStep }) => {
      return (
        <div className="stepper">
          {Array.from({ length: steps-1 }, (_, i) => (
            <div key={i} className={`step ${i < currentStep ? 'completed' : i === currentStep ? 'active' : ''}`}>
              <span className="step-number">{i + 1}</span>
            </div>
          ))}
        </div>
      );
  };

  const ItemForm = ({ formSchema, callbacks, loggedIn }) => {
    const initialFormState = formSchema.fields.reduce((obj, field) => ({
      ...obj,
      [field.name]: field.type === 'checkbox' ? false : ''
    }), {});

    const stepsCount = formSchema.fields.length % 4 === 0 ?
      formSchema.fields.length / 4 :
      Math.ceil(formSchema.fields.length / 4);

    const [item, setItem] = useState(initialFormState);
    const [errors, setErrors] = useState({});
    const [step, setStep] = useState(1);

    const validate = () => {
      const newErrors = {};
      formSchema.fields.forEach(field => {
        if (field.required && !field.validate(item[field.name])) {
          newErrors[field.name] = field.validateMessage;
        }
      });
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (event) => {
      const target = event.target;
      const value = target.type === 'checkbox' ? target.checked : target.value;
      const name = target.name;

      setItem({
        ...item,
        [name]: value
      });
      // Remove error once the value is changed
      if (errors[name]) {
        setErrors({
          ...errors,
          [name]: null
        });
      }
    };

    const handleButton = (event, field) => {
      event.preventDefault();
      if (callbacks && callbacks[field.onClick]) {
        if (field.category === "submit" && !loggedIn) {
          alert("Please log in to submit the form.");
          return;
        }
        console.log("hey",field.onClick)
        console.log("callbacks",callbacks)
        console.log("item",item)
        callbacks[field.onClick](event, item);
      }
    };

    const formButtons = formSchema.fields.filter(field => field.type === "button" && field.category === "form");
    const submitButtons = formSchema.fields.filter(field => field.type === "button" && field.category === "submit");
    const inputFields = formSchema.fields.filter(field => field.type !== "button");

    return (
      <div className="item-form-container">
        <form className="item-form" onSubmit={e => e.preventDefault()}>
          <h1>{formSchema.title}</h1>
          <Stepper steps={stepsCount} currentStep={step} />
          {inputFields
            .filter((_, index) => Math.ceil((index + 1) / 4) === step)
            .map((field, index) => (
              <div key={index}>
                <label>
                  {field.name}:
                  <input
                    type={field.type}
                    name={field.name}
                    value={item[field.name]}
                    checked={field.type === 'checkbox' ? item[field.name] : undefined}
                    onChange={handleInputChange}
                    required={field.required}
                    className="input"
                  />
                </label>
                {errors[field.name] && <div className="error">{errors[field.name]}</div>}
              </div>
          ))}
          {formButtons.map((field, index) => {
               if(loggedIn && field.name==="wallet"){
                return null
                }
          return  <button
              key={index}
              type="button"
              onClick={(event) => handleButton(event, field)}
            >
              {field.label}
            </button>
            }
          )}
        {step > 1 && <button type="button" onClick={() => setStep(step - 1)}>Previous</button>}
        {step < stepsCount-1 && stepsCount > 1 && <button type="button" onClick={() => setStep(step + 1)}>Next</button>}
        {step === stepsCount-1 && submitButtons.map((field, index) => (
  <button
    key={index}
    type="submit"
    onClick={(event) => handleButton(event, field)}
  >
    {field.label}
  </button>
))}
        </form>
      </div>
    );
  };

  export default ItemForm;
