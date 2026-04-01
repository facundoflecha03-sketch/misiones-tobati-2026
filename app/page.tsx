"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '../lib/firebase';
import { doc, onSnapshot, updateDoc, increment } from 'firebase/firestore';

export default function Home() {
  const router = useRouter();
  const [totalGeneral, setTotalGeneral] = useState(0);
  const [familiaSeleccionada, setFamiliaSeleccionada] = useState("");

  const familias = ["Arambulo", "Ardissone", "Castillo", "Centurion", "Fiorio", "Hoberuk", "Rasmussen"];

  useEffect(() => {
    // Escucha el total general en tiempo real
    const unsub = onSnapshot(doc(db, "configuracion", "capital"), (docSnap) => {
      if (docSnap.exists()) {
        setTotalGeneral(docSnap.data().total || 0);
      }
    }, (error) => {
      console.error("Error leyendo total general:", error);
    });
    return () => unsub();
  }, []);

  const sumarAporte = (campoFirebase: string) => {
    if (!familiaSeleccionada) {
      alert("¡Elegí tu familia primero!");
      return;
    }

    // 1. Guardamos la familia elegida y cambiamos de página inmediatamente
    localStorage.setItem('miFamilia', familiaSeleccionada);
    router.push('/gracias');

    // 2. Enviamos los datos a Firebase de fondo
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
      <div className="max-w-md w-full text-center space-y-10 pt-10">
        <h1 className="text-5xl font-black text-red-700 uppercase tracking-tighter">Tobatí MFS</h1>
        
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
              className={`p-6 bg-white border-2 rounded-3xl shadow-sm transition-all ${familiaSeleccionada ? 'border-red-200 active:scale-95' : 'opacity-50 grayscale cursor-not-allowed'}`}
            >
              <span className="text-4xl mb-2 block">{item.emoji}</span>
              <span className="font-bold text-slate-700">{item.nombre}</span>
            </button>
          ))}
        </section>

        <div className="p-8 bg-red-700 rounded-[2.5rem] text-white shadow-2xl">
          <p className="text-xs font-bold uppercase opacity-80 mb-1">Total Misión</p>
          <p className="text-6xl font-black">{totalGeneral}</p>
        </div>
      </div>
    </main>
  );
}