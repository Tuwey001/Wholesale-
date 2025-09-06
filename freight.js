// Freight services functionality

// Shipping rates and calculations
const shippingRates = {
  baseCostPerMile: 2.5,
  weightMultiplier: 0.15,
  serviceMultipliers: {
    standard: 1.0,
    express: 1.5,
    overnight: 2.5,
  },
  cargoMultipliers: {
    general: 1.0,
    agricultural: 1.2,
    fragile: 1.4,
    hazardous: 2.0,
  },
}

// Sample tracking data
const trackingData = {
  GT123456789: {
    status: "In Transit",
    currentLocation: "Chicago Distribution Center",
    estimatedDelivery: "2024-01-15",
    lastUpdated: "2024-01-12 14:30",
    timeline: [
      { date: "2024-01-10 09:00", location: "Origin Facility - New York", status: "Package Picked Up" },
      { date: "2024-01-10 15:30", location: "New York Sorting Facility", status: "In Transit" },
      { date: "2024-01-11 08:45", location: "Philadelphia Hub", status: "In Transit" },
      { date: "2024-01-12 14:30", location: "Chicago Distribution Center", status: "In Transit" },
      { date: "", location: "Destination Facility - Denver", status: "Pending" },
    ],
  },
  GT987654321: {
    status: "Delivered",
    currentLocation: "Delivered to Recipient",
    estimatedDelivery: "2024-01-10",
    lastUpdated: "2024-01-10 16:45",
    timeline: [
      { date: "2024-01-08 10:00", location: "Origin Facility - Los Angeles", status: "Package Picked Up" },
      { date: "2024-01-08 18:20", location: "Los Angeles Sorting Facility", status: "In Transit" },
      { date: "2024-01-09 12:15", location: "Phoenix Hub", status: "In Transit" },
      { date: "2024-01-10 09:30", location: "Denver Distribution Center", status: "Out for Delivery" },
      { date: "2024-01-10 16:45", location: "Delivered to Recipient", status: "Delivered" },
    ],
  },
}

// Initialize page
document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners()
  setMinDates()
})

// Setup event listeners
function setupEventListeners() {
  // Shipping calculator form
  const calculatorForm = document.getElementById("shippingCalculator")
  if (calculatorForm) {
    calculatorForm.addEventListener("submit", handleShippingCalculation)
  }

  // Tracking form
  const trackingForm = document.getElementById("trackingForm")
  if (trackingForm) {
    trackingForm.addEventListener("submit", handleTracking)
  }

  // Booking form
  const bookingForm = document.getElementById("bookingForm")
  if (bookingForm) {
    bookingForm.addEventListener("submit", handleBooking)
  }
}

// Set minimum dates for date inputs
function setMinDates() {
  const today = new Date().toISOString().split("T")[0]
  const pickupDate = document.getElementById("pickupDate")
  const deliveryDate = document.getElementById("deliveryDate")

  if (pickupDate) {
    pickupDate.min = today
    pickupDate.addEventListener("change", function () {
      if (deliveryDate) {
        deliveryDate.min = this.value
      }
    })
  }

  if (deliveryDate) {
    deliveryDate.min = today
  }
}

// Handle shipping calculation
function handleShippingCalculation(e) {
  e.preventDefault()

  const formData = {
    fromZip: document.getElementById("fromZip").value,
    toZip: document.getElementById("toZip").value,
    weight: Number.parseFloat(document.getElementById("weight").value),
    length: Number.parseFloat(document.getElementById("length").value),
    width: Number.parseFloat(document.getElementById("width").value),
    height: Number.parseFloat(document.getElementById("height").value),
    cargoType: document.getElementById("cargoType").value,
    serviceType: document.getElementById("serviceType").value,
    insurance: document.getElementById("insurance").checked,
    signature: document.getElementById("signature").checked,
  }

  // Basic validation
  if (
    !formData.fromZip ||
    !formData.toZip ||
    !formData.weight ||
    !formData.length ||
    !formData.width ||
    !formData.height ||
    !formData.cargoType ||
    !formData.serviceType
  ) {
    alert("Please fill in all required fields.")
    return
  }

  // Calculate shipping cost
  const result = calculateShippingCost(formData)
  displayShippingResults(result, formData)
}

// Calculate shipping cost
function calculateShippingCost(data) {
  // Simulate distance calculation (in real app, would use mapping API)
  const distance = Math.floor(Math.random() * 2000) + 100 // 100-2100 miles

  // Calculate dimensional weight
  const dimensionalWeight = (data.length * data.width * data.height) / 166
  const billableWeight = Math.max(data.weight, dimensionalWeight)

  // Base cost calculation
  let baseCost = distance * shippingRates.baseCostPerMile
  baseCost += billableWeight * shippingRates.weightMultiplier

  // Apply service type multiplier
  baseCost *= shippingRates.serviceMultipliers[data.serviceType]

  // Apply cargo type multiplier
  baseCost *= shippingRates.cargoMultipliers[data.cargoType]

  // Additional fees
  let additionalFees = 0
  if (data.insurance) additionalFees += 25
  if (data.signature) additionalFees += 5

  // Transit time based on service type and distance
  let transitTime
  switch (data.serviceType) {
    case "overnight":
      transitTime = "1 business day"
      break
    case "express":
      transitTime = distance > 1000 ? "2-3 business days" : "1-2 business days"
      break
    default:
      transitTime = distance > 1500 ? "5-7 business days" : "3-5 business days"
  }

  return {
    distance: distance,
    baseCost: baseCost,
    additionalFees: additionalFees,
    totalCost: baseCost + additionalFees,
    transitTime: transitTime,
    serviceType: data.serviceType,
  }
}

// Display shipping results
function displayShippingResults(result, formData) {
  document.getElementById("resultDistance").textContent = result.distance
  document.getElementById("resultTransit").textContent = result.transitTime
  document.getElementById("resultService").textContent =
    formData.serviceType.charAt(0).toUpperCase() + formData.serviceType.slice(1)
  document.getElementById("resultBase").textContent = result.baseCost.toFixed(2)
  document.getElementById("resultFees").textContent = result.additionalFees.toFixed(2)
  document.getElementById("resultTotal").textContent = result.totalCost.toFixed(2)

  document.getElementById("calculatorResults").style.display = "block"
  document.getElementById("calculatorResults").scrollIntoView({ behavior: "smooth" })
}

// Handle tracking
function handleTracking(e) {
  e.preventDefault()

  const trackingNumber = document.getElementById("trackingNumber").value.trim().toUpperCase()

  if (!trackingNumber) {
    alert("Please enter a tracking number.")
    return
  }

  // Simulate API call delay
  const submitBtn = e.target.querySelector('button[type="submit"]')
  const originalText = submitBtn.innerHTML
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Searching...'
  submitBtn.disabled = true

  setTimeout(() => {
    const trackingInfo = trackingData[trackingNumber]

    if (trackingInfo) {
      displayTrackingResults(trackingInfo, trackingNumber)
    } else {
      // Generate random tracking info for demo
      const randomTracking = generateRandomTracking()
      displayTrackingResults(randomTracking, trackingNumber)
    }

    submitBtn.innerHTML = originalText
    submitBtn.disabled = false
  }, 1500)
}

// Generate random tracking info for demo
function generateRandomTracking() {
  const statuses = ["In Transit", "Out for Delivery", "Delivered", "Processing"]
  const locations = [
    "New York Distribution Center",
    "Chicago Hub",
    "Los Angeles Facility",
    "Denver Sorting Center",
    "Atlanta Distribution Center",
  ]

  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]
  const randomLocation = locations[Math.floor(Math.random() * locations.length)]

  // Generate future delivery date
  const deliveryDate = new Date()
  deliveryDate.setDate(deliveryDate.getDate() + Math.floor(Math.random() * 5) + 1)

  return {
    status: randomStatus,
    currentLocation: randomLocation,
    estimatedDelivery: deliveryDate.toISOString().split("T")[0],
    lastUpdated: new Date().toISOString().slice(0, 16).replace("T", " "),
    timeline: [
      { date: "2024-01-10 09:00", location: "Origin Facility", status: "Package Picked Up" },
      { date: "2024-01-11 14:30", location: "Sorting Facility", status: "In Transit" },
      { date: "2024-01-12 10:15", location: randomLocation, status: randomStatus },
    ],
  }
}

// Display tracking results
function displayTrackingResults(trackingInfo, trackingNumber) {
  document.getElementById("trackingStatus").textContent = trackingInfo.status
  document.getElementById("trackingLocation").textContent = trackingInfo.currentLocation
  document.getElementById("trackingETA").textContent = formatDate(trackingInfo.estimatedDelivery)
  document.getElementById("trackingUpdated").textContent = trackingInfo.lastUpdated

  // Set status badge color
  const statusBadge = document.getElementById("trackingStatus")
  statusBadge.className = "badge "
  switch (trackingInfo.status.toLowerCase()) {
    case "delivered":
      statusBadge.className += "bg-success"
      break
    case "out for delivery":
      statusBadge.className += "bg-warning"
      break
    case "in transit":
      statusBadge.className += "bg-info"
      break
    default:
      statusBadge.className += "bg-secondary"
  }

  // Display timeline
  const timeline = document.getElementById("trackingTimeline")
  timeline.innerHTML = trackingInfo.timeline
    .map(
      (item, index) => `
        <div class="timeline-item ${item.date ? "completed" : "pending"}">
            <div class="timeline-marker">
                <i class="fas ${item.date ? "fa-check" : "fa-clock"}"></i>
            </div>
            <div class="timeline-content">
                <h6 class="mb-1">${item.status}</h6>
                <p class="mb-1">${item.location}</p>
                ${item.date ? `<small class="text-muted">${item.date}</small>` : '<small class="text-muted">Pending</small>'}
            </div>
        </div>
    `,
    )
    .join("")

  document.getElementById("trackingResults").style.display = "block"
  document.getElementById("trackingResults").scrollIntoView({ behavior: "smooth" })
}

// Handle booking
function handleBooking(e) {
  e.preventDefault()

  const form = e.target

  // Basic form validation
  if (!form.checkValidity()) {
    form.reportValidity()
    return
  }

  // Simulate booking submission
  const submitBtn = form.querySelector('button[type="submit"]')
  const originalText = submitBtn.innerHTML
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Processing...'
  submitBtn.disabled = true

  setTimeout(() => {
    // Generate booking confirmation number
    const confirmationNumber = "BK" + Math.random().toString(36).substr(2, 8).toUpperCase()

    alert(
      `Booking request submitted successfully!\n\nConfirmation Number: ${confirmationNumber}\n\nOur team will contact you within 2 hours to confirm pickup details and provide final pricing.`,
    )

    form.reset()
    submitBtn.innerHTML = originalText
    submitBtn.disabled = false
  }, 2000)
}

// Book shipment from calculator
function bookShipment() {
  alert("Redirecting to booking form with your calculated shipping details...")
  document.getElementById("bookingForm").scrollIntoView({ behavior: "smooth" })

  // Pre-fill some booking form fields if calculator was used
  const fromZip = document.getElementById("fromZip").value
  const toZip = document.getElementById("toZip").value

  if (fromZip) {
    document.getElementById("shipperZip").value = fromZip
  }
  if (toZip) {
    document.getElementById("recipientZip").value = toZip
  }
}

// Save quote
function saveQuote() {
  const quoteData = {
    fromZip: document.getElementById("fromZip").value,
    toZip: document.getElementById("toZip").value,
    weight: document.getElementById("weight").value,
    serviceType: document.getElementById("serviceType").value,
    totalCost: document.getElementById("resultTotal").textContent,
    timestamp: new Date().toISOString(),
  }

  // In a real application, this would save to a database
  localStorage.setItem("savedQuote", JSON.stringify(quoteData))
  alert("Quote saved successfully! You can reference this quote when booking your shipment.")
}

// Format date for display
function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

// Add timeline styles
const timelineStyles = `
<style>
.timeline {
    position: relative;
    padding-left: 30px;
}

.timeline-item {
    position: relative;
    padding-bottom: 20px;
}

.timeline-item:not(:last-child)::before {
    content: '';
    position: absolute;
    left: -19px;
    top: 30px;
    width: 2px;
    height: calc(100% - 10px);
    background-color: #6c757d;
}

.timeline-item.completed:not(:last-child)::before {
    background-color: #28a745;
}

.timeline-marker {
    position: absolute;
    left: -30px;
    top: 0;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background-color: #6c757d;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
}

.timeline-item.completed .timeline-marker {
    background-color: #28a745;
}

.timeline-content h6 {
    color: #fff;
    margin-bottom: 5px;
}

.timeline-content p {
    color: #e9ecef;
    margin-bottom: 5px;
}
</style>
`

// Inject timeline styles
document.head.insertAdjacentHTML("beforeend", timelineStyles)
