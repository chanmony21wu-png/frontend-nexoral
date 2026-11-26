import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, OrbitControls, ContactShadows, RoundedBox } from "@react-three/drei";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useScroll } from "framer-motion";
import { useProducts, addOrder } from "./Store.js";

const ACCENT = "#00f0ff";
const SHOP_NAME = "Nexora"; // change to your shop name
const TELEGRAM = "somakneathidaChheang"; // your Telegram username, without the @ sign

const PRODUCTS = [
  { id: 1, name: "Phantom 75 Keyboard", cat: "keyboard", price: 129, note: "Hot-swappable, wireless", img: "/images/1.png",
    desc: "A compact 75% keyboard with a metal case, per-key RGB and a smooth typing feel. Connects by Bluetooth, 2.4 GHz or USB-C.",
    specs: ["Layout: 75%, 82 keys", "Switches: hot-swappable", "Battery: 4000 mAh", "Connection: Bluetooth / 2.4 GHz / USB-C"] },
  { id: 2, name: "Vortex Pro Mouse", cat: "mouse", price: 79, note: "26K DPI, 58 g", img: "/images/2.png",
    desc: "A lightweight mouse with a flawless sensor and a comfortable shell. Designed for long sessions without fatigue.",
    specs: ["Weight: 58 g", "DPI: 26,000", "Battery: 70 h", "Connection: Bluetooth / 2.4 GHz / USB-C"] },
  { id: 3, name: "Aero 14 Laptop", cat: "laptop", price: 1199, note: "14-inch OLED, 18 h battery", img: "/images/3.png",
    desc: "A 14-inch laptop with an aluminium body under 1.2 kg and an OLED screen that stays sharp in daylight. Perfect for work and play.",
    specs: ["Screen: 14-inch OLED, 2880x1800", "Weight: 1.18 kg", "Battery: 18 h", "CPU: Intel i7-13700H", "GPU: RTX 4060"] },
  { id: 4, name: "Pulse TKL Keyboard", cat: "keyboard", price: 99, note: "Tactile switches", img: "/images/7.png",
    desc: "A tenkeyless keyboard with a metal case, per-key RGB and a smooth typing feel. Connects by Bluetooth, 2.4 GHz or USB-C.",
    specs: ["Layout: TKL, 87 keys", "Switches: tactile", "Battery: 4000 mAh", "Connection: Bluetooth / 2.4 GHz / USB-C"] },
  { id: 5, name: "Glide Ultralight Mouse", cat: "mouse", price: 69, note: "Wireless, 70 h battery", img: "/images/5.png",
    desc: "A wireless ultralight mouse with a flawless sensor and a comfortable shell. Designed for long sessions without fatigue.",
    specs: ["Weight: 58 g", "DPI: 26,000", "Battery: 70 h", "Connection: Bluetooth / 2.4 GHz / USB-C"] },
  { id: 6, name: "ROG ZEPHYRUS G16", cat: "laptop", price: 1599, note: "NVIDIA® GeForce RTX™ 5090, 240hz", img: "/images/6.png",
    desc: "A 16-inch gaming laptop with a high refresh rate display and powerful RTX graphics. Perfect for gaming and content creation.",
    specs: ["Screen: 16-inch, 2560x1600, 240 Hz", "Weight: 1.85 kg", "Battery: 160W", "CPU: Intel® Core™Ultra 9 386H", "GPU: RTX 5090"] },
  { id: 7, name: "MSI Optix MAG270VC", cat: "monitor", price: 299, note: "4K UHD, 144 Hz", img: "/images/4.png",
    desc: "A 27-inch monitor with 4K UHD resolution and a 144 Hz refresh rate. Perfect for gaming and productivity.",
    specs: ["Screen: 27-inch, 4K UHD", "Refresh Rate: 144 Hz", "Response Time: 1 ms", "Connectivity: HDMI / DisplayPort / USB-C"] },
  { id: 8, name: "ROG Strix XG27AQM", cat: "monitor", price: 399, note: "Curved, 165 Hz", img: "/images/8.png",
    desc: "A 32-inch curved monitor with a high refresh rate and immersive viewing experience. Perfect for gaming and entertainment.",
    specs: ["Screen: 32-inch, 2560x1440, Curved", "Refresh Rate: 165 Hz", "Response Time: 1 ms", "Connectivity: HDMI / DisplayPort / USB-C"] },
  { id: 8, name: "ROG Strix XG27AQM", cat: "monitor", price: 399, note: "Curved, 165 Hz", img: "/images/8.png",
    desc: "A 32-inch curved monitor with a high refresh rate and immersive viewing experience. Perfect for gaming and entertainment.",
    specs: ["Screen: 32-inch, 2560x1440, Curved", "Refresh Rate: 165 Hz", "Response Time: 1 ms", "Connectivity: HDMI / DisplayPort / USB-C"] },
    
];

const SHOWCASE = {
  keyboard: { title: "Phantom 75", text: "A compact 75% board with a metal case, gasket mount and per-key lighting.", img: "/images/1.png" },
  mouse: { title: "Vortex Pro", text: "A 58 g shell with a flawless sensor. Built for long sessions without fatigue.", img: "/images/2.png" },
  laptop: { title: "Aero 14", text: "An aluminium body under 1.2 kg with an OLED screen that stays sharp in daylight.", img: "/images/3.png" },
  monitor: { title: "Nexus 27", text: "A 27-inch monitor with 4K UHD resolution and a 144 Hz refresh rate.", img: "/images/4.png" },
};

const FEATURES = [
  { title: "Fast delivery", text: "We pack and ship your order quickly." },
  { title: "Quality products", text: "Every item is checked before it is sent." },
  { title: "Chat support", text: "Ask us anything on Telegram before you buy.", telegram: true },
];

const BANNERS = [
  { img: "/images/10.png", title: "Level up your setup", text: "New gaming gear every week. Pick your favorites today." },
  { img: "/images/14.png", title: "Built for gamers", text: "Keyboards, mice, laptops and monitors in one place." },
  { img: "/images/15.png", title: "", text: "" },
];

const NEW_ARRIVALS = [
  { id: 101, name: "Nova Gaming Headset", cat: "headset", price: 89, note: "7.1 surround, wireless", img: "/images/9.png",
    desc: "A wireless gaming headset with clear 7.1 surround sound and a soft, comfortable fit for long sessions.",
    specs: ["Sound: 7.1 surround", "Battery: 40 h", "Microphone: detachable", "Connection: 2.4 GHz / Bluetooth"] },
  { id: 102, name: "Stealth XL Mousepad", cat: "mousepad", price: 25, note: "Extra large, RGB edge", img: "/images/13.png",
    desc: "An extra large mousepad with a smooth surface and a glowing RGB edge. It covers your keyboard and mouse.",
    specs: ["Size: 900 x 400 mm", "Surface: smooth cloth", "Lighting: RGB edge", "Base: non-slip rubber"] },
  { id: 103, name: "Lumen 1080p Webcam", cat: "webcam", price: 59, note: "Full HD, auto focus", img: "/images/11.png",
    desc: "A Full HD webcam with fast auto focus and a built-in microphone. Great for streaming and video calls.",
    specs: ["Video: 1080p, 60 fps", "Focus: auto", "Microphone: built-in stereo", "Connection: USB-C"] },
  { id: 104, name: "Titan Gaming Chair", cat: "chair", price: 249, note: "Ergonomic, adjustable", img: "/images/12.png",
    desc: "An ergonomic gaming chair with adjustable arms, a reclining back and strong support for long hours.",
    specs: ["Recline: up to 180°", "Armrests: 4D adjustable", "Load: up to 150 kg", "Material: breathable leather"] },
];

/* ---------- 3D models built from shapes (used when a product has no photo) ---------- */

function Keyboard({ accent }) {
  const keys = [];
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 12; c++) keys.push([-2.03 + c * 0.37, 0.2, -0.55 + r * 0.34, (r * 3 + c) % 7 === 0]);
  return (
    <group rotation={[0.35, 0, 0]}>
      <RoundedBox args={[4.7, 0.25, 1.9]} radius={0.08}>
        <meshStandardMaterial color="#232a47" metalness={0.8} roughness={0.3} />
      </RoundedBox>
      {keys.map(([x, y, z, hl], i) => (
        <RoundedBox key={i} args={[0.31, 0.16, 0.28]} radius={0.04} position={[x, y, z]}>
          <meshStandardMaterial color={hl ? accent : "#3a4268"} emissive={hl ? accent : "#000000"} emissiveIntensity={hl ? 0.9 : 0} roughness={0.4} />
        </RoundedBox>
      ))}
      <RoundedBox args={[2.4, 0.16, 0.28]} radius={0.04} position={[0, 0.2, 0.8]}>
        <meshStandardMaterial color="#3a4268" roughness={0.4} />
      </RoundedBox>
    </group>
  );
}

function Mouse({ accent }) {
  return (
    <group rotation={[0.3, 0, 0]} scale={1.3}>
      <mesh scale={[0.9, 0.5, 1.4]}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshStandardMaterial color="#2a3152" metalness={0.7} roughness={0.25} />
      </mesh>
      <mesh position={[0, 0.45, -0.5]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.1, 0.1, 0.18, 24]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1} />
      </mesh>
      <mesh position={[0, 0.3, -0.2]}>
        <boxGeometry args={[0.02, 0.02, 1.0]} />
        <meshStandardMaterial color="#05060d" />
      </mesh>
      <mesh position={[0, -0.4, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1.5, 1]}>
        <torusGeometry args={[0.8, 0.03, 16, 64]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.2} />
      </mesh>
    </group>
  );
}

function Laptop({ accent }) {
  const metal = <meshStandardMaterial color="#c4c8d8" metalness={0.9} roughness={0.25} />;
  return (
    <group position={[0, -0.6, 0]} rotation={[0.1, 0, 0]}>
      <RoundedBox args={[3.4, 0.12, 2.2]} radius={0.05}>{metal}</RoundedBox>
      <group position={[0, 0.06, -1.1]} rotation={[-0.2, 0, 0]}>
        <RoundedBox args={[3.4, 2.2, 0.08]} radius={0.05} position={[0, 1.1, 0]}>{metal}</RoundedBox>
        <mesh position={[0, 1.1, 0.05]}>
          <planeGeometry args={[3.1, 1.95]} />
          <meshStandardMaterial color="#0a0d1a" emissive={accent} emissiveIntensity={0.4} />
        </mesh>
      </group>
    </group>
  );
}

function Monitor({ accent }) {
  const body = <meshStandardMaterial color="#232a47" metalness={0.8} roughness={0.3} />;
  return (
    <group position={[0, -0.2, 0]}>
      <RoundedBox args={[4, 2.3, 0.12]} radius={0.06} position={[0, 0.9, 0]}>{body}</RoundedBox>
      <mesh position={[0, 0.9, 0.07]}>
        <planeGeometry args={[3.8, 2.1]} />
        <meshStandardMaterial color="#0a0d1a" emissive={accent} emissiveIntensity={0.45} />
      </mesh>
      <mesh position={[0, -0.6, -0.05]}>
        <boxGeometry args={[0.25, 0.7, 0.12]} />
        {body}
      </mesh>
      <RoundedBox args={[1.6, 0.08, 0.9]} radius={0.03} position={[0, -0.95, 0]}>{body}</RoundedBox>
    </group>
  );
}

const MODELS = { keyboard: Keyboard, mouse: Mouse, laptop: Laptop, monitor: Monitor };

function Scene({ type, controls }) {
  const spin = useRef();
  const Model = MODELS[type] || Keyboard;
  useFrame((state) => {
    if (!controls && spin.current) spin.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.7) * 0.7;
  });
  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[0, 6, 3]} intensity={2} />
      <pointLight position={[5, 5, 5]} intensity={70} />
      <pointLight position={[-5, 2, -3]} intensity={50} color="#ff2bd6" />
      <Float speed={2} rotationIntensity={0.25} floatIntensity={0.8}>
        <group ref={spin}>
          <Model accent={ACCENT} />
        </group>
      </Float>
      <ContactShadows position={[0, -1.7, 0]} opacity={0.5} blur={2.5} scale={10} />
      {controls && <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={2} />}
    </>
  );
}

function Viewer({ type, controls = false }) {
  return (
    <Canvas camera={{ position: [0, 3.2, 6.5], fov: 40 }} dpr={[1, 2]}>
      <Scene type={type} controls={controls} />
    </Canvas>
  );
}

function TiltImage({ src, alt }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rx = useSpring(useTransform(y, [-0.5, 0.5], [14, -14]), { stiffness: 200, damping: 20 });
  const ry = useSpring(useTransform(x, [-0.5, 0.5], [-14, 14]), { stiffness: 200, damping: 20 });

  const move = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - r.left) / r.width - 0.5);
    y.set((e.clientY - r.top) / r.height - 0.5);
  };
  const leave = () => { x.set(0); y.set(0); };

  return (
    <div className="tilt" onMouseMove={move} onMouseLeave={leave}>
      <motion.div
        className="float"
        animate={{ y: [0, -12, 0], rotateY: [-8, 8, -8] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformPerspective: 800 }}
      >
        <motion.img
          src={src}
          alt={alt}
          style={{ rotateX: rx, rotateY: ry, transformPerspective: 800 }}
          whileHover={{ scale: 1.08 }}
        />
      </motion.div>
    </div>
  );
}

/* ---------- Page ---------- */

/* ---------- hero showcase: the products take turns on a glowing stage ---------- */
function HeroShowcase({ items, onOpen }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (items.length < 2) return;
    const t = setInterval(() => setI((n) => (n + 1) % items.length), 4500);
    return () => clearInterval(t);
  }, [items.length]);

  if (items.length === 0) return null;
  const p = items[i % items.length];

  return (
    <div className="stage">
      <div className="ring r1" />
      <div className="ring r2" />
      <div className="ring r3" />

      <AnimatePresence mode="wait">
        <motion.div
          key={p.id}
          className="stage-img"
          initial={{ opacity: 0, scale: 0.85, rotate: -4 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, scale: 0.9, rotate: 4 }}
          transition={{ duration: 0.6 }}
          onClick={() => onOpen(p)}
        >
          <TiltImage src={p.img} alt={p.name} />
        </motion.div>
      </AnimatePresence>

      <motion.div className="float-card fc-1" key={`a${p.id}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.5 }}>
        <small>{p.cat}</small>
        <strong>{p.name}</strong>
      </motion.div>
      <motion.div className="float-card fc-2" key={`b${p.id}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45, duration: 0.5 }}>
        <small>From</small>
        <strong>${p.price}</strong>
      </motion.div>

      {items.length > 1 && (
        <div className="stage-dots">
          {items.map((_, k) => (
            <button key={k} className={k === i % items.length ? "dot on" : "dot"} onClick={() => setI(k)} aria-label={`Show product ${k + 1}`} />
          ))}
        </div>
      )}
    </div>
  );
}

// The name shown on each filter button.
// Left side = the category word from the admin (lowercase, one word). Right side = the text on the button.
const catNames = {
  all: "All",
  keyboard: "Keyboards",
  mouse: "Mice",
  laptop: "Laptops",
  monitor: "Monitors",
  headset: "Headsets",
  mousepad: "Mousepads",
  webcam: "Webcams",
  chair: "Chairs",
};

const catLabel = (c) => {
  if (catNames[c]) return catNames[c];
  const name = c[0].toUpperCase() + c.slice(1); // a category not in the list above
  return name.endsWith("s") ? name : name + "s";
};

export default function App() {
  const [cart, setCart] = useState([]);
  const [filter, setFilter] = useState("all");
  const [tab, setTab] = useState("keyboard");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [checkout, setCheckout] = useState(false);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", address: "", note: "" });
  const setField = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const [query, setQuery] = useState("");
  const [collFilter, setCollFilter] = useState("all");
  const { scrollYProgress } = useScroll();

  // The database (your admin) is the main product list. The lists in this file are only a backup for when the server is off.
  const api = useProducts();
  const useBackup = !api.loaded && api.error; // the server is off and nothing was saved before
  const shopItems = api.loaded ? api.products.filter((p) => p.section !== "collection") : useBackup ? PRODUCTS : [];
  const collection = api.loaded ? api.products.filter((p) => p.section === "collection") : useBackup ? NEW_ARRIVALS : [];
  const collCats = ["all", ...new Set(collection.map((p) => p.cat))];
  const activeColl = collCats.includes(collFilter) ? collFilter : "all";
  const shownCollection = activeColl === "all" ? collection : collection.filter((p) => p.cat === activeColl);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setSlide((n) => (n + 1) % BANNERS.length), 4000);
    return () => clearInterval(t);
  }, [paused]);

  const total = cart.reduce((s, p) => s + p.price, 0);
  const q = query.trim().toLowerCase();
  const list = shopItems.filter(
    (p) => (filter === "all" || p.cat === filter) && (!q || `${p.name} ${p.note} ${p.cat}`.toLowerCase().includes(q))
  );
  const add = (p) => setCart((c) => [...c, p]);
  const remove = (i) => setCart((c) => c.filter((_, idx) => idx !== i));
  const clearCart = () => setCart([]);

  const submitOrder = async (e) => {
    e.preventDefault();
    if (sending || cart.length === 0) return;
    setSending(true);

    const customer = {
      customer_name: form.name.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      note: form.note.trim(),
    };

    // the message that opens in Telegram
    const lines = cart.map((p) => `- ${p.name} ($${p.price})`).join("\n");
    const parts = [`New order from ${SHOP_NAME}`, "", `Name: ${customer.customer_name}`];
    if (customer.phone) parts.push(`Phone: ${customer.phone}`);
    parts.push(`Address / map link: ${customer.address}`);
    if (customer.note) parts.push(`Note: ${customer.note}`);
    parts.push("", "Items:", lines, `Total: $${total}`);
    const text = parts.join("\n");

    const win = window.open("", "_blank"); // opened first so the browser does not block it
    try { await addOrder(cart, customer); } catch {} // saved in the admin when the server is running
    try { await navigator.clipboard.writeText(text); } catch {}
    const url = `https://t.me/${TELEGRAM}?text=${encodeURIComponent(text)}`;
    if (win) win.location.href = url;
    else window.location.href = url;

    setCart([]);
    setCheckout(false);
    setForm({ name: "", phone: "", address: "", note: "" });
    setSending(false);
  };

  return (
    <div className="page">
      <motion.div className="progress" style={{ scaleX: scrollYProgress }} />
      <header className="nav">
        <a className="logo" href="#top">{SHOP_NAME}</a>
        <nav>
          <a href="#shop">Shop</a>
          <a href="#arrivals">New</a>
          <a href="#showcase">Take a look</a>
          <a href="#contact">Contact</a>
        </nav>
        <button className="cart-btn" onClick={() => setOpen(true)}>Cart ({cart.length})</button>
      </header>

      <section
        className="hero"
        id="top"
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
          e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
        }}
      >
        <motion.div
          className="hero-text"
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.15 } } }}
        >
          <motion.span className="badge" variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } }}>
            New gaming gear every week
          </motion.span>
          <motion.h1 variants={{ hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0 } }}>
            Welcome to <span className="grad">Nexora</span>, your gaming shop for all your needs.
          </motion.h1>
          <motion.p variants={{ hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0 } }}>
            Nexora is a gaming shop that offers a wide range of gaming products, including keyboards, mouse, laptops, and monitors. We provide high-quality products that are designed to enhance your gaming experience.
          </motion.p>
          <motion.div className="hero-actions" variants={{ hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0 } }}>
            <a className="btn" href="#shop">Shopping Now</a>
            <a className="btn ghost" href="#arrivals">View collection</a>
          </motion.div>
        </motion.div>
        <motion.div className="hero-3d" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2 }}>
          <HeroShowcase items={shopItems.filter((p) => p.img).slice(0, 6)} onOpen={setSelected} />
        </motion.div>
      </section>

      <section className="section" id="shop">
        <div className="section-head">
          <h2>Shop all gear</h2>
          <div className="search">
            <input
              type="search"
              placeholder="Search keyboard, mouse, laptop..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search products"
            />
          </div>
          <div className="chips">
            {["all", ...new Set(shopItems.map((p) => p.cat))].map((c) => (
              <button key={c} className={filter === c ? "chip on" : "chip"} onClick={() => setFilter(c)}>
                {catLabel(c)}
              </button>
            ))}
          </div>
        </div>
        <motion.div layout className="grid">
          <AnimatePresence>
            {list.map((p) => (
              <motion.article
                layout
                key={p.id}
                className="card"
                onClick={() => setSelected(p)}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -6 }}
              >
                <div className="card-art">
                  {p.img ? <TiltImage src={p.img} alt={p.name} /> : <Viewer type={p.cat} />}
                </div>
                <h3>{p.name}</h3>
                <p>{p.note}</p>
                <div className="card-foot">
                  <strong>${p.price}</strong>
                  <button className="btn small" onClick={(e) => { e.stopPropagation(); add(p); }}>Add to cart</button>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>
        {!api.loaded && api.loading ? (
          <p className="no-results">Loading products...</p>
        ) : (
          list.length === 0 && (
            <p className="no-results">
              {query || filter !== "all"
                ? "No products found. Try another word."
                : "No products in the shop yet. Add some in the admin page (Products, then + Add product)."}
              <span style={{ display: "block", marginTop: "0.6rem", fontSize: "0.85rem", opacity: 0.7 }}>
                The server sent {api.products.length} product(s): {shopItems.length} for this grid, {collection.length} for Collection.
              </span>
            </p>
          )
        )}
      </section>

      <section className="section showcase" id="showcase">
        <div className="show-3d">
          {SHOWCASE[tab].img ? <TiltImage src={SHOWCASE[tab].img} alt={SHOWCASE[tab].title} /> : <Viewer type={tab} controls />}
        </div>
        <div className="show-text">
          <div className="chips">
            {Object.keys(SHOWCASE).map((k) => (
              <button key={k} className={tab === k ? "chip on" : "chip"} onClick={() => setTab(k)}>
                {k[0].toUpperCase() + k.slice(1)}
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
              <h2>{SHOWCASE[tab].title}</h2>
              <p>{SHOWCASE[tab].text}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      <section className="marquee" aria-label="Our products">
        <div className="marquee-track">
          {[...shopItems, ...shopItems].map((p, k) => (
            <div className="marquee-item" key={k} onClick={() => setSelected(p)}>
              {p.img && <img src={p.img} alt={p.name} />}
              <span>{p.name}</span>
            </div>
          ))}
        </div>
      </section>

      <motion.section
        className="banner"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <AnimatePresence>
          <motion.img
            key={slide}
            className="banner-img"
            src={BANNERS[slide].img}
            alt="Nexora banner"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          />
        </AnimatePresence>
        <div className="banner-text">
          {BANNERS[slide].title && <h2>{BANNERS[slide].title}</h2>}
          {BANNERS[slide].text && <p>{BANNERS[slide].text}</p>}
          <a className="btn" href="#arrivals">Building your collection</a>
        </div>
        <div className="dots">
          {BANNERS.map((_, k) => (
            <button key={k} className={k === slide ? "dot on" : "dot"} onClick={() => setSlide(k)} aria-label={`Show banner ${k + 1}`} />
          ))}
        </div>
      </motion.section>

      <section className="section" id="arrivals">
        <div className="section-head">
          <h2>Collection</h2>
          <div className="chips">
            {collCats.map((c) => (
              <button key={c} className={activeColl === c ? "chip on" : "chip"} onClick={() => setCollFilter(c)}>
                {catLabel(c)}
              </button>
            ))}
          </div>
        </div>
        <div className="arrivals">
          {shownCollection.map((p, k) => (
            <motion.article
              className="arrival"
              key={p.id}
              onClick={() => setSelected(p)}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: k * 0.12 }}
              whileHover={{ y: -8 }}
            >
              <div className="arrival-art">
                <TiltImage src={p.img} alt={p.name} />
              </div>
              <h3>{p.name}</h3>
              <p>{p.note}</p>
              <div className="card-foot">
                <strong>${p.price}</strong>
                <button className="btn small" onClick={(e) => { e.stopPropagation(); add(p); }}>Add to cart</button>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="features">
        {FEATURES.map((f, k) => {
          const Tag = f.telegram ? motion.a : motion.div;
          const link = f.telegram ? { href: `https://t.me/${TELEGRAM}`, target: "_blank", rel: "noreferrer" } : {};
          return (
            <Tag
              key={f.title}
              className={f.telegram ? "feature clickable" : "feature"}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: k * 0.15 }}
              {...link}
            >
              <h3>{f.title}</h3>
              <p>{f.text}</p>
              {f.telegram && <span className="go">Chat on Telegram</span>}
            </Tag>
          );
        })}
      </section>

      <footer className="footer" id="contact">
        <h2>Questions before you order?</h2>
        <p>Message us on Telegram and we will reply the same day.</p>
        <a className="btn" href="#top">Back to home</a>
        <small>© {new Date().getFullYear()} {SHOP_NAME}</small>
      </footer>

      <AnimatePresence>
        {selected && (
          <motion.div className="modal-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelected(null)}>
            <motion.div
              className="modal"
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="modal-close" onClick={() => setSelected(null)} aria-label="Close">×</button>
              <div className="modal-art">
                {selected.img ? <TiltImage src={selected.img} alt={selected.name} /> : <Viewer type={selected.cat} controls />}
              </div>
              <div className="modal-info">
                <h2>{selected.name}</h2>
                <p>{selected.desc || selected.note}</p>
                {selected.specs && (
                  <ul>
                    {selected.specs.map((sp) => <li key={sp}>{sp}</li>)}
                  </ul>
                )}
                <div className="card-foot">
                  <strong>${selected.price}</strong>
                  <button className="btn" onClick={() => { add(selected); setSelected(null); setOpen(true); }}>Add to cart</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {checkout && (
          <motion.div className="modal-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCheckout(false)}>
            <motion.form
              className="checkout"
              onSubmit={submitOrder}
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.96 }}
            >
              <button type="button" className="modal-close" onClick={() => setCheckout(false)} aria-label="Close">×</button>
              <h2>Delivery details</h2>
              <p>Fill this in. Then Telegram opens with your order ready to send.</p>

              <label className="co-field">
                <span>Your name</span>
                <input required value={form.name} onChange={setField("name")} placeholder="Full name" autoComplete="name" />
              </label>
              <label className="co-field">
                <span>Phone number (optional)</span>
                <input type="tel" value={form.phone} onChange={setField("phone")} placeholder="012 345 678" autoComplete="tel" />
              </label>
              <label className="co-field">
                <span>Address or map link</span>
                <textarea required rows="3" value={form.address} onChange={setField("address")} placeholder="Type your address, or paste a Google Maps link" />
              </label>
              <label className="co-field">
                <span>Note (optional)</span>
                <input value={form.note} onChange={setField("note")} placeholder="Anything we should know?" />
              </label>

              <div className="co-summary"><span>{cart.length} item(s)</span><strong>${total}</strong></div>
              <button className="btn" type="submit" disabled={sending}>{sending ? "Please wait..." : "Send order to Telegram"}</button>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <>
            <motion.div className="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
            <motion.aside className="drawer" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 28, stiffness: 260 }}>
              <div className="drawer-head">
                <h3>Your cart</h3>
                <div className="drawer-actions">
                  {cart.length > 0 && <button className="chip clear" onClick={clearCart}>Remove all</button>}
                  <button className="chip" onClick={() => setOpen(false)}>Close</button>
                </div>
              </div>
              {cart.length === 0 && <p className="empty">Your cart is empty. Add a keyboard, mouse or laptop to start.</p>}
              {cart.map((p, i) => (
                <div className="row" key={i}>
                  <span>{p.name}</span>
                  <span>${p.price}</span>
                  <button className="x" onClick={() => remove(i)} aria-label={`Remove ${p.name}`}>×</button>
                </div>
              ))}
              {cart.length > 0 && (
                <div className="drawer-foot">
                  <div className="row"><strong>Total</strong><strong>${total}</strong></div>
                  <button className="btn" onClick={() => { setOpen(false); setCheckout(true); }}>Place order</button>
                </div>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}