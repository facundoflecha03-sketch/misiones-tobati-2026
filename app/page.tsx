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

  // LISTA ACTUALIZADA CON LA FAMILIA DESCALZO
  const familias = ["Arambulo", "Ardissone", "Castillo", "Centurion", "Descalzo", "Fiorio", "Hoberuk", "Rasmussen"];

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "configuracion", "capital"), (docSnap) => {
      if (docSnap.exists()) setTotalGeneral(docSnap.data().total || 0);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const targetDate = new Date('2026-07-01T00:00:00');
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
    localStorage.setItem('miFamilia', familiaSeleccionada);
    router.push('/gracias');

    const globalRef = doc(db, "configuracion", "capital");
    const familiaRef = doc(db, "familias", familiaSeleccionada);

    updateDoc(globalRef, { total: increment(1), [campoFirebase]: increment(1) });
    updateDoc(familiaRef, { total: increment(1) });
  };

  return (
    <main className="relative min-h-screen flex flex-col items-center p-6 text-slate-900 font-sans overflow-x-hidden">
      
      <div className="fixed inset-0 -z-10">
        <img src="/iglesia.jpg" alt="Fondo" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      <div className="max-w-md w-full text-center space-y-8 pt-6 relative z-10">
        <header className="space-y-2">
          <h1 className="text-5xl font-black text-white uppercase tracking-tighter drop-shadow-lg text-balance">Tobatí MFS</h1>
          <p className="text-sm font-bold text-red-400 uppercase tracking-widest italic drop-shadow">
            "Nada sin ti, nada sin nosotros"
          </p>
        </header>

        <section className="bg-red-700/90 shadow-xl rounded-3xl p-6 text-white font-bold backdrop-blur-sm border-2 border-red-500/30">
          <p className="text-xs uppercase opacity-80 mb-3 tracking-widest text-center">Faltan para la misión</p>
          <div className="flex justify-center gap-4">
            {Object.entries(timeLeft).map(([label, value]) => (
              <div key={label} className="flex flex-col items-center min-w-[3rem]">
                <span className="text-3xl font-black leading-none mb-1">{value}</span>
                <span className="text-[10px] uppercase opacity-70 tracking-wider">{label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white/95 p-6 rounded-3xl shadow-xl backdrop-blur-sm">
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
              className={`p-6 bg-white/95 backdrop-blur-sm border-2 rounded-3xl shadow-lg transition-all ${familiaSeleccionada ? 'border-red-200 active:scale-95' : 'opacity-50 grayscale cursor-not-allowed'}`}
            >
              <span className="text-4xl mb-2 block">{item.emoji}</span>
              <span className="font-bold text-slate-700">{item.nombre}</span>
            </button>
          ))}
        </section>

        <div className="p-8 bg-white/95 rounded-[2.5rem] text-red-700 shadow-xl backdrop-blur-sm">
          <p className="text-xs font-black uppercase mb-3 text-slate-500 tracking-wider leading-tight px-4 text-balance">
            Capitales de gracia entregados por Tobatí
          </p>
          <p className="text-6xl font-black tracking-tighter">{totalGeneral}</p>
        </div>
      </div>
    </main>
  );
}