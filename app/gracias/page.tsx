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
      if (snapshot.empty) {
        setErrorFirebase("La base de datos está vacía o sin permisos.");
        return;
      }
      
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Ordena las familias de mayor a menor según el total
      setRanking(docs.sort((a: any, b: any) => (b.total || 0) - (a.total || 0)));
      setErrorFirebase(""); 
    }, (error) => {
      setErrorFirebase(error.message);
    });

    return () => unsub();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center bg-red-700 p-6 text-white text-center font-sans">
      <div className="max-w-md w-full space-y-8 pt-10">
        <h1 className="text-4xl font-black uppercase tracking-tighter">¡GRACIAS POR TU ENTREGA!</h1>

        <div className="bg-white text-slate-900 rounded-[2.5rem] p-6 shadow-2xl min-h-[300px] flex flex-col">
          <h2 className="text-xl font-bold text-red-700 mb-4 uppercase">🏆 Ranking en Vivo</h2>
          
          {errorFirebase ? (
            <div className="bg-yellow-100 p-4 rounded-xl border-2 border-yellow-400 text-yellow-800 text-sm font-bold text-left">
              ⚠️ ATENCIÓN:<br/><br/>{errorFirebase}
            </div>
          ) : (
            <div className="space-y-2 text-left flex-1">
              {ranking.length === 0 ? (
                <p className="text-center text-slate-400 py-10 italic">Cargando posiciones...</p>
              ) : (
                ranking.map((fam, index) => (
                  <div key={fam.id} className={`flex justify-between items-center p-4 rounded-2xl ${fam.id === miFamilia ? 'bg-red-600 text-white shadow-lg' : 'bg-slate-50'}`}>
                    <span className="font-bold">{index + 1}° {fam.id}</span>
                    <span className="font-black text-xl">{fam.total || 0}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <button 
          onClick={() => router.push('/')}
          className="w-full bg-white text-red-700 py-5 rounded-full font-bold text-xl shadow-xl active:scale-95 transition-all"
        >
          VOLVER A SUMAR
        </button>
      </div>
    </main>
  );
}