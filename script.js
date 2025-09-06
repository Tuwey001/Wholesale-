// Main JavaScript functionality for The Wholesale King Ltd
// Form validation utilities
const FormValidator = {
  // Email validation
  validateEmail: (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return emailRegex.test(email)
  },

  // Phone validation (US format)
  validatePhone: (phone) => {
    const phoneRegex = /^[+]?[1]?[\s\-.]?[$$]?[0-9]{3}[$$]?[\s\-.]?[0-9]{3}[\s\-.]?[0-9]{4}$/
    return phoneRegex.test(phone.replace(/\s/g, ""))
  },

  // Name validation
  validateName: (name) => {
    return name.trim().length >= 2 && /^[a-zA-Z\s'-]+$/.test(name)
  },

  // Required field validation
  validateRequired: (value) => {
    return value && value.trim().length > 0
  },

  // Show field error
  showFieldError: (fieldId, message) => {
    const field = document.getElementById(fieldId)
    const existingError = field.parentNode.querySelector(".field-error")

    if (existingError) {
      existingError.remove()
    }

    field.classList.add("is-invalid")
    const errorDiv = document.createElement("div")
    errorDiv.className = "field-error text-danger small mt-1"
    errorDiv.innerHTML = `<i class="fas fa-exclamation-circle me-1"></i>${message}`
    field.parentNode.appendChild(errorDiv)
  },

  // Clear field error
  clearFieldError: (fieldId) => {
    const field = document.getElementById(fieldId)
    const existingError = field.parentNode.querySelector(".field-error")

    if (existingError) {
      existingError.remove()
    }
    field.classList.remove("is-invalid")
    field.classList.add("is-valid")
  },

  // Clear all errors in form
  clearAllErrors: (formId) => {
    const form = document.getElementById(formId)
    const errors = form.querySelectorAll(".field-error")
    const invalidFields = form.querySelectorAll(".is-invalid")

    errors.forEach((error) => error.remove())
    invalidFields.forEach((field) => {
      field.classList.remove("is-invalid")
      field.classList.remove("is-valid")
    })
  },
}

// Real-time validation for form fields
function setupRealTimeValidation(formId) {
  const form = document.getElementById(formId)
  if (!form) return

  const fields = form.querySelectorAll("input, select, textarea")

  fields.forEach((field) => {
   
    field.addEventListener("blur", function () {
      validateField(this)
    })

    field.addEventListener("focus", function () {
      FormValidator.clearFieldError(this.id)
    })

    if (field.type === "email") {
      field.addEventListener("input", function () {
        if (this.value.length > 0) {
          validateField(this)
        }
      })
    }

    if (field.type === "tel") {
      field.addEventListener("input", function () {
        // Auto-format phone number
        let value = this.value.replace(/\D/g, "")
        if (value.length >= 6) {
          value = value.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3")
        } else if (value.length >= 3) {
          value = value.replace(/(\d{3})(\d{0,3})/, "($1) $2")
        }
        this.value = value

        if (this.value.length > 0) {
          validateField(this)
        }
      })
    }
  })
}

// Validate individual field
function validateField(field) {
  const fieldId = field.id
  const value = field.value.trim()
  const fieldType = field.type
  const isRequired = field.hasAttribute("required")

  // Check required fields
  if (isRequired && !FormValidator.validateRequired(value)) {
    FormValidator.showFieldError(fieldId, "This field is required")
    return false
  }

  // Skip validation for empty optional fields
  if (!isRequired && !value) {
    FormValidator.clearFieldError(fieldId)
    return true
  }

  // Specific field validations
  switch (fieldType) {
    case "email":
      if (!FormValidator.validateEmail(value)) {
        FormValidator.showFieldError(fieldId, "Please enter a valid email address")
        return false
      }
      break

    case "tel":
      if (!FormValidator.validatePhone(value)) {
        FormValidator.showFieldError(fieldId, "Please enter a valid phone number")
        return false
      }
      break

    case "text":
      if (fieldId.includes("Name") || fieldId.includes("name")) {
        if (!FormValidator.validateName(value)) {
          FormValidator.showFieldError(fieldId, "Please enter a valid name (letters only)")
          return false
        }
      }
      break

    case "number":
      if (value && (isNaN(value) || Number.parseFloat(value) <= 0)) {
        FormValidator.showFieldError(fieldId, "Please enter a valid positive number")
        return false
      }
      break
  }

  FormValidator.clearFieldError(fieldId)
  return true
}

// Enhanced form submission with validation
function setupFormSubmission(formId, successMessage, submitEndpoint = null) {
  const form = document.getElementById(formId)
  if (!form) return

  form.addEventListener("submit", async (e) => {
    e.preventDefault()

    // Clear previous errors
    FormValidator.clearAllErrors(formId)

    // Validate all fields
    const fields = form.querySelectorAll("input, select, textarea")
    let isValid = true

    fields.forEach((field) => {
      if (!validateField(field)) {
        isValid = false
      }
    })

    if (!isValid) {
      // Scroll to first error
      const firstError = form.querySelector(".field-error")
      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth", block: "center" })
      }
      return
    }

    // Get submit button
    const submitBtn = form.querySelector('button[type="submit"]')
    const originalText = submitBtn.innerHTML

    // Show loading state
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Sending...'
    submitBtn.disabled = true

    try {
      // Collect form data
      const formData = new FormData(form)
      const data = Object.fromEntries(formData.entries())

      // Add timestamp
      data.timestamp = new Date().toISOString()
      data.formType = formId

      // Simulate API call or actual submission
      if (submitEndpoint) {
        const response = await fetch(submitEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          throw new Error("Network response was not ok")
        }
      } else {
        // Simulate delay for demo
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }

      // Success handling
      showSuccessMessage(successMessage)
      form.reset()
      FormValidator.clearAllErrors(formId)
    } catch (error) {
      console.error("Form submission error:", error)
      showErrorMessage("There was an error sending your message. Please try again or contact us directly.")
    } finally {
      // Restore button
      submitBtn.innerHTML = originalText
      submitBtn.disabled = false
    }
  })
}

// Show success message
function showSuccessMessage(message) {
  const alertDiv = document.createElement("div")
  alertDiv.className = "alert alert-success alert-dismissible fade show position-fixed"
  alertDiv.style.cssText = "top: 100px; right: 20px; z-index: 9999; min-width: 300px;"
  alertDiv.innerHTML = `
    <i class="fas fa-check-circle me-2"></i>${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `

  document.body.appendChild(alertDiv)

  // Auto remove after 5 seconds
  setTimeout(() => {
    if (alertDiv.parentNode) {
      alertDiv.remove()
    }
  }, 5000)
}

// Show error message
function showErrorMessage(message) {
  const alertDiv = document.createElement("div")
  alertDiv.className = "alert alert-danger alert-dismissible fade show position-fixed"
  alertDiv.style.cssText = "top: 100px; right: 20px; z-index: 9999; min-width: 300px;"
  alertDiv.innerHTML = `
    <i class="fas fa-exclamation-triangle me-2"></i>${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `

  document.body.appendChild(alertDiv)

  // Auto remove after 7 seconds
  setTimeout(() => {
    if (alertDiv.parentNode) {
      alertDiv.remove()
    }
  }, 7000)
}

// Smooth scrolling for navigation links
document.addEventListener("DOMContentLoaded", () => {
  // Add smooth scrolling to all links with hash
  const links = document.querySelectorAll('a[href^="#"]')
  links.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault()
      const target = document.querySelector(this.getAttribute("href"))
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }
    })
  })

  // Add fade-in animation to cards on scroll
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("fade-in")
      }
    })
  }, observerOptions)

  // Observe all cards
  document.querySelectorAll(".card").forEach((card) => {
    observer.observe(card)
  })

  // Setup form validation and submission for all forms
  setupRealTimeValidation("contactForm")
  setupRealTimeValidation("greenhouseForm")
  setupRealTimeValidation("quoteForm")

  setupFormSubmission("contactForm", "Thank you for your message! We will get back to you within 24 hours.")
  setupFormSubmission(
    "greenhouseForm",
    "Thank you for your consultation request! We will contact you within 24 hours to discuss your greenhouse project.",
  )
})

// Greenhouse form submission
document.addEventListener("DOMContentLoaded", () => {
  const greenhouseForm = document.getElementById("greenhouseForm")
  if (greenhouseForm) {
    greenhouseForm.addEventListener("submit", function (e) {
      e.preventDefault()

      // Get form data
      const formData = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        phone: document.getElementById("phone").value,
        service: document.getElementById("service").value,
        size: document.getElementById("size").value,
        message: document.getElementById("message").value,
      }

      // Basic validation
      if (!formData.name || !formData.email || !formData.phone || !formData.service) {
        alert("Please fill in all required fields.")
        return
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        alert("Please enter a valid email address.")
        return
      }

      // Simulate form submission
      const submitBtn = this.querySelector('button[type="submit"]')
      const originalText = submitBtn.innerHTML
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Submitting...'
      submitBtn.disabled = true

      // Simulate API call
      setTimeout(() => {
        alert("Thank you for your inquiry! We will contact you within 24 hours to discuss your greenhouse project.")
        this.reset()
        submitBtn.innerHTML = originalText
        submitBtn.disabled = false
      }, 2000)
    })
  }
})

// Quote request function
function requestQuote(packageName) {
  const modal = `
        <div class="modal fade" id="quoteModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content bg-dark">
                    <div class="modal-header border-secondary">
                        <h5 class="modal-title text-white">Request Quote - ${packageName}</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="quoteForm">
                            <div class="mb-3">
                                <label for="quoteName" class="form-label text-white">Full Name *</label>
                                <input type="text" class="form-control bg-dark text-white border-secondary" id="quoteName" required>
                            </div>
                            <div class="mb-3">
                                <label for="quoteEmail" class="form-label text-white">Email Address *</label>
                                <input type="email" class="form-control bg-dark text-white border-secondary" id="quoteEmail" required>
                            </div>
                            <div class="mb-3">
                                <label for="quotePhone" class="form-label text-white">Phone Number *</label>
                                <input type="tel" class="form-control bg-dark text-white border-secondary" id="quotePhone" required>
                            </div>
                            <div class="mb-3">
                                <label for="quoteSize" class="form-label text-white">Desired Size (sq ft) *</label>
                                <input type="number" class="form-control bg-dark text-white border-secondary" id="quoteSize" min="100" required>
                            </div>
                            <div class="mb-3">
                                <label for="quoteBudget" class="form-label text-white">Budget Range</label>
                                <select class="form-select bg-dark text-white border-secondary" id="quoteBudget">
                                    <option value="">Select budget range</option>
                                    <option value="under-25k">Under $25,000</option>
                                    <option value="25k-50k">$25,000 - $50,000</option>
                                    <option value="50k-100k">$50,000 - $100,000</option>
                                    <option value="over-100k">Over $100,000</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label for="quoteTimeline" class="form-label text-white">Desired Timeline</label>
                                <select class="form-select bg-dark text-white border-secondary" id="quoteTimeline">
                                    <option value="">Select timeline</option>
                                    <option value="asap">As soon as possible</option>
                                    <option value="1-3months">1-3 months</option>
                                    <option value="3-6months">3-6 months</option>
                                    <option value="6months+">6+ months</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label for="quoteNotes" class="form-label text-white">Additional Requirements</label>
                                <textarea class="form-control bg-dark text-white border-secondary" id="quoteNotes" rows="3" placeholder="Tell us about any specific requirements or questions..."></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer border-secondary">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-success" onclick="submitQuote('${packageName}')">
                            <i class="fas fa-paper-plane me-2"></i>Request Quote
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `

  // Remove existing modal if any
  const existingModal = document.getElementById("quoteModal")
  if (existingModal) {
    existingModal.remove()
  }

  // Add modal to body
  document.body.insertAdjacentHTML("beforeend", modal)

  // Setup validation for the modal form
  setupRealTimeValidation("quoteForm")

  // Show modal
  const modalElement = new window.bootstrap.Modal(document.getElementById("quoteModal"))
  modalElement.show()
}

// Submit quote function
function submitQuote(packageName) {
  const form = document.getElementById("quoteForm")

  // Clear previous errors
  FormValidator.clearAllErrors("quoteForm")

  // Validate all required fields
  const requiredFields = form.querySelectorAll("[required]")
  let isValid = true

  requiredFields.forEach((field) => {
    if (!validateField(field)) {
      isValid = false
    }
  })

  if (!isValid) {
    return
  }

  // Get form data
  const formData = {
    package: packageName,
    name: document.getElementById("quoteName").value,
    email: document.getElementById("quoteEmail").value,
    phone: document.getElementById("quotePhone").value,
    size: document.getElementById("quoteSize").value,
    budget: document.getElementById("quoteBudget").value,
    timeline: document.getElementById("quoteTimeline").value,
    notes: document.getElementById("quoteNotes").value,
    timestamp: new Date().toISOString(),
  }

  // Show loading state
  const submitBtn = document.querySelector("#quoteModal .btn-success")
  const originalText = submitBtn.innerHTML
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Submitting...'
  submitBtn.disabled = true

  // Simulate quote submission
  setTimeout(() => {
    showSuccessMessage(
      `Thank you for your interest in our ${packageName}! We will prepare a detailed quote and contact you within 24 hours.`,
    )

    // Close modal
    const modal = window.bootstrap.Modal.getInstance(document.getElementById("quoteModal"))
    modal.hide()

    // Reset button
    submitBtn.innerHTML = originalText
    submitBtn.disabled = false
  }, 2000)
}

// Navbar scroll effect
window.addEventListener("scroll", () => {
  const navbar = document.querySelector(".navbar")
  if (window.scrollY > 50) {
    navbar.style.backgroundColor = "rgba(26, 26, 26, 0.95)"
    navbar.style.backdropFilter = "blur(10px)"
  } else {
    navbar.style.backgroundColor = ""
    navbar.style.backdropFilter = ""
  }
})

// Loading animation for buttons
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("btn") && !e.target.disabled) {
    const btn = e.target
    const originalText = btn.innerHTML

    // Add loading state for form submissions
    if (btn.type === "submit") {
      btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Processing...'
      btn.disabled = true

      setTimeout(() => {
        btn.innerHTML = originalText
        btn.disabled = false
      }, 2000)
    }
  }
})
