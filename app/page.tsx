"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '../lib/firebase';
import { doc, onSnapshot, updateDoc, increment } from 'firebase/firestore';

export default function Home() {
  const router = useRouter();
  const [totalGeneral, setTotalGeneral] = useState(0);
  const [familiaSeleccionada, setFamiliaSeleccionada] = useState("");
  const [timeLeft, setTimeLeft] = useState({ meses: 0, dias: 0, horas: 0, minutos: 0 });

  const familias = ["Arambulo", "Ardissone", "Castillo", "Centurion", "Fiorio", "Hoberuk", "Rasmussen"];

  // 1. Efecto para leer el total de Firebase en vivo
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "configuracion", "capital"), (docSnap) => {
      if (docSnap.exists()) {
        setTotalGeneral(docSnap.data().total || 0);
      }
    }, (error) => {
      console.error("Error leyendo total general:", error);
    });
    return () => unsub();
  }, []);

  // 2. Efecto para el contador de tiempo (Julio 2026)
  useEffect(() => {
    const targetDate = new Date('2026-07-01T00:00:00'); // Fecha de inicio de la misión
    const timer = setInterval(() => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();
      
      if (diff > 0) {
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        setTimeLeft({
          meses: Math.floor(d / 30),
          dias: d % 30,
          horas: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutos: Math.floor((diff / 1000 / 60) % 60)
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const sumarAporte = (campoFirebase: string) => {
    if (!familiaSeleccionada) {
      alert("¡Elegí tu familia primero!");
      return;
    }

    // Navegación instantánea para que no se trabe la pantalla
    localStorage.setItem('miFamilia', familiaSeleccionada);
    router.push('/gracias');

    // Envío de fondo a Firebase
    const globalRef = doc(db, "configuracion", "capital");
    const familiaRef = doc(db, "familias", familiaSeleccionada);

    updateDoc(globalRef, { 
      total: increment(1),
      [campoFirebase]: increment(1) 
    }).catch((error) => {
      alert("❌ ERROR FIREBASE (Global): " + error.message);
    });

    updateDoc(familiaRef, { 
      total: increment(1) 
    }).catch((error) => {
      alert("❌ ERROR FIREBASE (Familia): " + error.message);
    });
  };

  return (
    <main className="flex min-h-screen flex-col items-center bg-slate-50 p-6 text-slate-900 font-sans">
      <div className="max-w-md w-full text-center space-y-8 pt-6">
        
        {/* Título y Lema */}
        <header className="space-y-2">
          <h1 className="text-5xl font-black text-red-700 uppercase tracking-tighter">Tobatí MFS</h1>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest italic">
            "Nada sin ti, nada sin nosotros"
          </p>
        </header>

        {/* Contador de Tiempo */}
        <section className="bg-red-700 shadow-xl rounded-3xl p-6 text-white font-bold border-4 border-red-800/20">
          <p className="text-xs uppercase opacity-80 mb-3 text-center tracking-widest">Faltan para la misión</p>
          <div className="flex justify-center gap-4">
            {Object.entries(timeLeft).map(([label, value]) => (
              <div key={label} className="flex flex-col items-center min-w-[3rem]">
                <span className="text-3xl font-black leading-none mb-1">{value}</span>
                <span className="text-[10px] uppercase opacity-70 tracking-wider">{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Selector de Familia */}
        <section className="bg-white p-6 rounded-3xl shadow-xl border-2 border-red-100">
          <p className="font-bold text-red-700 mb-2 uppercase text-xs">1. ¿Qué familia sos?</p>
          <select 
            className="w-full p-4 rounded-xl bg-slate-100 font-bold text-center outline-none cursor-pointer"
            value={familiaSeleccionada}
            onChange={(e) => setFamiliaSeleccionada(e.target.value)}
          >
            <option value="">-- Seleccionar --</option>
            {familias.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </section>

        {/* Botones de Aporte */}
        <section className="grid grid-cols-2 gap-4">
          {[
            { id: 'Rosario', nombre: 'Rosario', emoji: '📿' },
            { id: 'Adoracion', nombre: 'Adoración', emoji: '🕯️' },
            { id: 'Misa', nombre: 'Misa', emoji: '🍷' },
            { id: 'Caridad', nombre: 'Caridad', emoji: '🤝' }
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => sumarAporte(item.id)}
              className={`p-6 bg-white border-2 rounded-3xl shadow-sm transition-all ${familiaSeleccionada ? 'border-red-200 active:scale-95 hover:shadow-md' : 'opacity-50 grayscale cursor-not-allowed'}`}
            >
              <span className="text-4xl mb-2 block">{item.emoji}</span>
              <span className="font-bold text-slate-700">{item.nombre}</span>
            </button>
          ))}
        </section>

        {/* Total General */}
        <div className="p-8 bg-white border-4 border-red-700 rounded-[2.5rem] text-red-700 shadow-xl">
          <p className="text-xs font-black uppercase opacity-60 mb-1 text-slate-500 tracking-widest">Total Misión</p>
          <p className="text-6xl font-black tracking-tighter">{totalGeneral}</p>
        </div>
      </div>
    </main>
  );
}