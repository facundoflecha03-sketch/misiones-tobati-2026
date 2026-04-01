"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '../../lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

export default function Gracias() {
  const router = useRouter();
  const [ranking, setRanking] = useState<any[]>([]);
  const [miFamilia, setMiFamilia] = useState("");
  const [errorFirebase, setErrorFirebase] = useState("");

  useEffect(() => {
    setMiFamilia(localStorage.getItem('miFamilia') || "");
    const unsub = onSnapshot(collection(db, "familias"), (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRanking(docs.sort((a: any, b: any) => (b.total || 0) - (a.total || 0)));
    }, (error) => setErrorFirebase(error.message));
    return () => unsub();
  }, []);

  return (
    <main className="relative min-h-screen flex flex-col items-center p-6 text-white text-center font-sans overflow-x-hidden">
      
      {/* CAPA DE FONDO IGUAL A LA PRINCIPAL */}
      <div className="fixed inset-0 -z-10">
        <img src="/iglesia.jpg" className="w-full h-full object-cover" alt="Fondo Iglesia Tobatí" />
        <div className="absolute inset-0 bg-black/70"></div> {/* Un toque más oscuro para que la lista resalte bien */}
      </div>

      <div className="max-w-md w-full space-y-8 pt-10 relative z-10">
        <h1 className="text-4xl font-black uppercase tracking-tighter drop-shadow-md">¡GRACIAS POR TU ENTREGA!</h1>

        <div className="bg-white/95 text-slate-900 rounded-[2.5rem] p-6 shadow-2xl backdrop-blur-md min-h-[300px] flex flex-col border-2 border-white/20">
          <h2 className="text-xl font-bold text-red-700 mb-4 uppercase">🏆 Ranking en Vivo</h2>
          <div className="space-y-2 text-left flex-1">
            {ranking.map((fam, index) => (
              <div key={fam.id} className={`flex justify-between items-center p-4 rounded-2xl ${fam.id === miFamilia ? 'bg-red-600 text-white shadow-lg' : 'bg-slate-50 border border-slate-100'}`}>
                <span className="font-bold">{index + 1}° {fam.id}</span>
                <span className="font-black text-xl">{fam.total || 0}</span>
              </div>
            ))}
          </div>
        </div>

        <button 
          onClick={() => router.push('/')}
          className="w-full bg-white/95 text-red-700 py-5 rounded-full font-bold text-xl shadow-xl active:scale-95 transition-all backdrop-blur-md border-2 border-white/20"
        >
          VOLVER A SUMAR
        </button>
      </div>
    </main>
  );
}