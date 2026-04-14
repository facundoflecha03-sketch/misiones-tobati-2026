"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '../../lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

export default function Gracias() {
  const router = useRouter();
  const [ranking, setRanking] = useState<any[]>([]);
  const [miComision, setMiComision] = useState("");

  useEffect(() => {
    setMiComision(localStorage.getItem('miComision') || "");
    
    // CAMBIO A COLECCIÓN COMISIONES
    const unsub = onSnapshot(collection(db, "comisiones"), (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRanking(docs.sort((a: any, b: any) => (b.total || 0) - (a.total || 0)));
    });
    return () => unsub();
  }, []);

  return (
    <main className="relative min-h-screen flex flex-col items-center p-6 text-white text-center font-sans">
      
      <div className="fixed inset-0 -z-10">
        <img src="/iglesia.jpg" className="w-full h-full object-cover" alt="fondo" />
        <div className="absolute inset-0 bg-black/70"></div>
      </div>

      <div className="max-w-md w-full space-y-8 pt-10 relative z-10">
        <h1 className="text-4xl font-black uppercase tracking-tighter drop-shadow-md text-balance">¡GRACIAS POR TU ENTREGA!</h1>

        <div className="bg-white/95 text-slate-900 rounded-[2.5rem] p-6 shadow-2xl backdrop-blur-md min-h-[300px] flex flex-col border-2 border-white/20">
          <h2 className="text-xl font-bold text-red-700 mb-4 uppercase">🏆 Ranking de Comisiones</h2>
          <div className="space-y-2 text-left flex-1">
            {ranking.map((com, index) => (
              <div key={com.id} className={`flex justify-between items-center p-4 rounded-2xl ${com.id === miComision ? 'bg-red-600 text-white shadow-lg' : 'bg-slate-50 border border-slate-100'}`}>
                <span className="font-bold">{index + 1}° {com.id}</span>
                <span className="font-black text-xl">{com.total || 0}</span>
              </div>
            ))}
          </div>
        </div>

        <button 
          onClick={() => router.push('/')}
          className="w-full bg-white/95 text-red-700 py-5 rounded-full font-bold text-xl shadow-xl active:scale-95 transition-all backdrop-blur-md"
        >
          VOLVER A SUMAR
        </button>
      </div>
    </main>
  );
}