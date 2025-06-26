// Import Three.js library
import * as THREE from "three"

// Global variables
let scene, camera, renderer, clock
let scrollY = 0
let currentSection = 0
let isLoading = true

// 3D Objects
let sphere,
  torus,
  boxes = [],
  cylinder,
  icosahedron
let sphereGroup, torusGroup, boxGroup, cylinderGroup, icosahedronGroup

// Colors for different sections
const colors = [
  0xff6b6b, // Red
  0x4ecdc4, // Teal
  0x45b7d1, // Blue
  0x96ceb4, // Green
  0xfeca57, // Yellow
]

// Initialize the application
function init() {
  // Create scene
  scene = new THREE.Scene()

  // Create camera
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.set(0, 0, 5)

  // Create renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap

  document.getElementById("canvas-container").appendChild(renderer.domElement)

  // Create clock
  clock = new THREE.Clock()

  // Setup lighting
  setupLighting()

  // Create 3D objects
  create3DObjects()

  // Setup event listeners
  setupEventListeners()

  // Start loading simulation
  simulateLoading()

  // Start render loop
  animate()
}

function setupLighting() {
  // Ambient light
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
  scene.add(ambientLight)

  // Directional light
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
  directionalLight.position.set(10, 10, 5)
  directionalLight.castShadow = true
  scene.add(directionalLight)

  // Point light
  const pointLight = new THREE.PointLight(0xff6b6b, 0.5)
  pointLight.position.set(-10, -10, -10)
  scene.add(pointLight)
}

function create3DObjects() {
  // Section 1: Floating Sphere
  sphereGroup = new THREE.Group()
  const sphereGeometry = new THREE.SphereGeometry(1.5, 64, 64)
  const sphereMaterial = new THREE.MeshStandardMaterial({
    color: colors[0],
    roughness: 0.1,
    metalness: 0.8,
  })
  sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
  sphereGroup.add(sphere)
  sphereGroup.position.set(0, 0, 0)
  scene.add(sphereGroup)

  // Add text for section 1
  createText("INNOVATION", new THREE.Vector3(-2, -3, 0), sphereGroup)

  // Section 2: Torus
  torusGroup = new THREE.Group()
  const torusGeometry = new THREE.TorusGeometry(1.2, 0.4, 16, 100)
  const torusMaterial = new THREE.MeshStandardMaterial({
    color: colors[1],
    roughness: 0.2,
    metalness: 0.6,
  })
  torus = new THREE.Mesh(torusGeometry, torusMaterial)
  torus.position.set(2, 0, 0)
  torusGroup.add(torus)
  torusGroup.position.set(0, -10, 0)
  scene.add(torusGroup)

  createText("CREATIVITY", new THREE.Vector3(-2.5, -2, 0), torusGroup)

  // Section 3: Box cluster
  boxGroup = new THREE.Group()
  const boxGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.8)
  const boxMaterial = new THREE.MeshStandardMaterial({
    color: colors[2],
    roughness: 0.3,
    metalness: 0.7,
  })

  for (let i = 0; i < 5; i++) {
    const box = new THREE.Mesh(boxGeometry, boxMaterial)
    const angle = (i / 5) * Math.PI * 2
    box.position.set(Math.cos(angle) * 3, Math.sin(angle) * 2, Math.sin(angle * 2) * 1)
    boxes.push(box)
    boxGroup.add(box)
  }
  boxGroup.position.set(0, -20, 0)
  scene.add(boxGroup)

  createText("TECHNOLOGY", new THREE.Vector3(-2, -4, 0), boxGroup)

  // Section 4: Cylinder
  cylinderGroup = new THREE.Group()
  const cylinderGeometry = new THREE.CylinderGeometry(1, 1.5, 3, 32)
  const cylinderMaterial = new THREE.MeshStandardMaterial({
    color: colors[3],
    roughness: 0.1,
    metalness: 0.9,
  })
  cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial)
  cylinderGroup.add(cylinder)
  cylinderGroup.position.set(0, -30, 0)
  scene.add(cylinderGroup)

  createText("FUTURE", new THREE.Vector3(-1.5, -3, 0), cylinderGroup)

  // Section 5: Icosahedron
  icosahedronGroup = new THREE.Group()
  const icosahedronGeometry = new THREE.IcosahedronGeometry(2, 1)
  const icosahedronMaterial = new THREE.MeshStandardMaterial({
    color: colors[4],
    roughness: 0.2,
    metalness: 0.8,
    wireframe: true,
  })
  icosahedron = new THREE.Mesh(icosahedronGeometry, icosahedronMaterial)
  icosahedronGroup.add(icosahedron)
  icosahedronGroup.position.set(0, -40, 0)
  scene.add(icosahedronGroup)

  createText("TOGETHER", new THREE.Vector3(-2.5, -4, 0), icosahedronGroup)
}

function createText(text, position, parent) {
  const loader = new THREE.FontLoader()
  // For simplicity, we'll create simple text geometry
  // In a real implementation, you'd load a font file
  const textGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1)
  const textMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff })
  const textMesh = new THREE.Mesh(textGeometry, textMaterial)
  textMesh.position.copy(position)
  parent.add(textMesh)
}

function setupEventListeners() {
  // Scroll event
  window.addEventListener("scroll", onScroll)

  // Resize event
  window.addEventListener("resize", onWindowResize)

  // Menu toggle
  document.getElementById("menuToggle").addEventListener("click", toggleMenu)

  // Progress dots
  document.querySelectorAll(".progress-dot").forEach((dot, index) => {
    dot.addEventListener("click", () => scrollToSection(index))
  })

  // Close menu when clicking outside
  document.addEventListener("click", (e) => {
    const menu = document.getElementById("navMenu")
    const toggle = document.getElementById("menuToggle")
    if (!menu.contains(e.target) && !toggle.contains(e.target)) {
      menu.classList.remove("active")
    }
  })
}

function onScroll() {
  if (isLoading) return

  scrollY = window.pageYOffset
  const maxScroll = document.body.scrollHeight - window.innerHeight
  const scrollProgress = scrollY / maxScroll

  // Update current section
  const newSection = Math.floor(scrollProgress * 5)
  if (newSection !== currentSection && newSection >= 0 && newSection < 5) {
    currentSection = newSection
    updateProgressIndicator()
    updateScrollIndicator()
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

function toggleMenu() {
  const menu = document.getElementById("navMenu")
  menu.classList.toggle("active")
}

function scrollToSection(sectionIndex) {
  const targetY = (sectionIndex / 5) * (document.body.scrollHeight - window.innerHeight)
  window.scrollTo({ top: targetY, behavior: "smooth" })
}

function updateProgressIndicator() {
  document.querySelectorAll(".progress-dot").forEach((dot, index) => {
    dot.classList.toggle("active", index === currentSection)
  })
}

function updateScrollIndicator() {
  const indicator = document.getElementById("scrollIndicator")
  indicator.classList.toggle("hidden", currentSection >= 4)
}

function simulateLoading() {
  let progress = 0
  const loadingInterval = setInterval(() => {
    progress += Math.random() * 15
    if (progress >= 100) {
      progress = 100
      clearInterval(loadingInterval)
      setTimeout(() => {
        document.getElementById("loadingScreen").classList.add("hidden")
        isLoading = false
      }, 500)
    }

    document.getElementById("progressFill").style.width = progress + "%"
    document.getElementById("progressText").textContent = Math.round(progress) + "%"
  }, 100)
}

function animate() {
  requestAnimationFrame(animate)

  if (isLoading) {
    renderer.render(scene, camera)
    return
  }

  const elapsedTime = clock.getElapsedTime()
  const maxScroll = document.body.scrollHeight - window.innerHeight
  const scrollProgress = scrollY / maxScroll

  // Camera movement based on scroll
  camera.position.x = Math.sin(scrollProgress * Math.PI * 2) * 2
  camera.position.y = scrollProgress * -10 + 2
  camera.position.z = 5 + Math.cos(scrollProgress * Math.PI) * 2
  camera.lookAt(0, scrollProgress * -10, 0)

  // Animate sphere
  if (sphere) {
    sphere.rotation.x = elapsedTime * 0.5
    sphere.rotation.y = elapsedTime * 0.3
    sphere.position.y = Math.sin(elapsedTime) * 0.5
  }

  // Animate torus
  if (torus) {
    torus.rotation.x = elapsedTime * 0.3
    torus.rotation.z = elapsedTime * 0.5
    torus.position.x = 2 + Math.cos(elapsedTime * 0.5) * 0.5
  }

  // Animate boxes
  boxes.forEach((box, index) => {
    box.rotation.y = elapsedTime * 0.4 + index * 0.1
    box.rotation.z = elapsedTime * 0.2 + index * 0.05
    box.position.z = Math.sin(elapsedTime * 0.3 + index) * 0.5
  })

  // Animate cylinder
  if (cylinder) {
    cylinder.rotation.x = elapsedTime * 0.6
    cylinder.position.y = Math.cos(elapsedTime * 0.4) * 0.5
  }

  // Animate icosahedron
  if (icosahedron) {
    icosahedron.rotation.x = elapsedTime * 0.2
    icosahedron.rotation.y = elapsedTime * 0.3
    icosahedron.rotation.z = elapsedTime * 0.1
  }

  // Add floating effect to groups
  if (sphereGroup) {
    sphereGroup.position.y = Math.sin(elapsedTime * 0.5) * 0.2
    sphereGroup.rotation.y = elapsedTime * 0.1
  }

  if (torusGroup) {
    torusGroup.position.y = -10 + Math.sin(elapsedTime * 0.7) * 0.3
    torusGroup.rotation.z = elapsedTime * 0.05
  }

  if (boxGroup) {
    boxGroup.position.y = -20 + Math.sin(elapsedTime * 0.6) * 0.2
    boxGroup.rotation.y = elapsedTime * 0.1
  }

  if (cylinderGroup) {
    cylinderGroup.position.y = -30 + Math.sin(elapsedTime * 0.8) * 0.25
    cylinderGroup.rotation.x = elapsedTime * 0.05
  }

  if (icosahedronGroup) {
    icosahedronGroup.position.y = -40 + Math.sin(elapsedTime * 0.4) * 0.3
    icosahedronGroup.rotation.y = elapsedTime * 0.08
  }

  renderer.render(scene, camera)
}

// Initialize when page loads
window.addEventListener("load", init)

// Add smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault()
    const target = document.querySelector(this.getAttribute("href"))
    if (target) {
      target.scrollIntoView({ behavior: "smooth" })
    }
  })
})

// Add intersection observer for section detection
const observerOptions = {
  root: null,
  rootMargin: "0px",
  threshold: 0.5,
}

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const sectionIndex = Number.parseInt(entry.target.id.replace("section", "")) - 1
      if (sectionIndex !== currentSection) {
        currentSection = sectionIndex
        updateProgressIndicator()
        updateScrollIndicator()
      }
    }
  })
}, observerOptions)

// Observe all sections
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".section").forEach((section) => {
    sectionObserver.observe(section)
  })
})
