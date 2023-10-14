import React, { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'
import styles from 'pages/Auth/Auth.scss'

const OtpInputField = ({ error, onChange, touched, setError, clearOnReset, numOfInputs, inputType, inputMode }) => {

  const [otp, setOtp] = useState(new Array(numOfInputs).fill())
  const [activeInput, setActiveInput] = useState(0)
  const numberReg = /^[0-9\b]+$/;
  const inputForm = useRef();

  useEffect(() => {
    if(otp && !otp.includes()) {
      onChange(otp.join(''))
    } else {
      onChange('')
    }
  }, [otp])

  useEffect(() => {
    if(clearOnReset) {
      setOtp(new Array(numOfInputs).fill())
    }
  }, [clearOnReset])

  const getOTPValue = () => (otp ? otp.slice() : []);

  const handleInputFocus = (activeIndex) => {
    let activeTab = activeIndex
    if(activeIndex === numOfInputs) {
      activeTab -= 1
    }
    setActiveInput(activeTab)
    inputForm?.current?.elements[activeTab]?.focus()
  }

  const handleFocus = (event) => (index) => {
    handleInputFocus(index)
    event.target.select()
  }

  const handleBlur = () => {
    setActiveInput(activeInput - 1)
  }

  useEffect(() => {
    setTimeout(() => {
      handleInputFocus(0)
    }, 0)
  }, [])

  const onKeyDown = (elmnt, val) => {
    if (elmnt.key === 'Delete' || elmnt.key === 'Backspace') {
      if(error) {
        setError()
      }
      const next = elmnt.target.tabIndex - 2
      if (next > -1 && !val) {
        handleInputFocus(next)
      }
    } else if (
      elmnt.code === 'Spacebar' ||
      elmnt.code === 'Space' ||
      elmnt.code === 'ArrowUp' ||
      elmnt.code === 'ArrowDown' ||
      elmnt.code === 'Tab'
    ) {
      elmnt.preventDefault();
    }
  }

  const changeCodeAtFocus = (value) => {
    const otp = getOTPValue();
    otp[activeInput] = value[0];
    setOtp(otp)
  };

  const handleDataFromMessage = (pastedData) => {
    handleInputFocus(0)
    if(numberReg.test(pastedData)) {
      let pastedArray = pastedData.split('')
      const otp = getOTPValue();
      for(let i = 0; i < numOfInputs; i++) {
        otp[i] = pastedArray[i];
      }
      setOtp(otp)
    }
    setTimeout(() => {
      handleInputFocus(pastedData.length)
    }, 0)
  }

  const isInputValueValid = (value) => {
    return value === '' ||  (value.trim().length === 1 && numberReg.test(value));
  };

  const handleChange = (e) => {
    if(e.target.value && e.target.value.length === numOfInputs && numberReg.test(e.target.value)) {
      handleDataFromMessage(e.target.value)
    } else if (isInputValueValid(e.target.value)) {
      changeCodeAtFocus(e.target.value)
      if(e.target.value) {
        const next = e.target.tabIndex
        if (next < numOfInputs) {
          handleInputFocus(next)
        }
      }
    }
  }

  const handleOnPaste = (event) => {
    event.preventDefault()
    const pastedData = event.clipboardData.getData('text/plain')
    if(pastedData.length <= numOfInputs) {
      handleDataFromMessage(pastedData)
    }
  }

  return (
    <div className={styles.otpWrapper}>
      <form className={styles.otpForm} ref={inputForm}>
        {otp.map((value, index) => {
          return (
            <input
              name={`otp${index}`}
              type={inputType}
              className={cx(styles.otpInput, { [`${styles.filled}`]: value })}
              value={value ?? ''}
              tabIndex={index + 1}
              maxLength='1'
              onKeyDown={(e) => onKeyDown(e, value)}
              onChange={(e) => handleChange(e)}
              onPaste={handleOnPaste}
              inputMode={inputMode}
              onFocus={(event) => handleFocus(event)(index)}
              onBlur={handleBlur}
            />
          )
        })}
      </form>
      {error ? <div className={cx(styles.errorMessage, styles.otpError)}>{error}</div> : null}
    </div>
  )
}

OtpInputField.defaultProps = {
  numOfInputs: 6,
  inputType: 'number',
  inputMode: 'numeric'
}

OtpInputField.propTypes = {
  error: PropTypes.string,
  onChange: PropTypes.func,
  touched: PropTypes.bool,
  setError: PropTypes.func,
  clearOnReset: PropTypes.bool,
  numOfInputs: PropTypes.number,
  inputType: PropTypes.string,
  inputMode: PropTypes.string
}

export default OtpInputField
