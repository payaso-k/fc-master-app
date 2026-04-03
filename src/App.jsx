import { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue, remove } from "firebase/database";
import "./App.css";

// ------------------------------------------
// ★ここに「新しく作ったSaaS専用の鍵」を貼り付けてください！
// （クライアント用アプリに入れたのと同じものです）
// ------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyDo5cjW-NLN2VvISK0y-95uTYSi3i5zBMM",
  authDomain: "fcmanager-ff1fd.firebaseapp.com",
  projectId: "fcmanager-ff1fd",
  storageBucket: "fcmanager-ff1fd.firebasestorage.app",
  messagingSenderId: "938142530767",
  appId: "1:938142530767:web:6021b0456aac2a9a0f0bba"
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export default function MasterApp() {
  const [allowedTeams, setAllowedTeams] = useState({});
  const [newTeamId, setNewTeamId] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  // VIPリスト（allowedTeams）をデータベースから読み込む
  useEffect(() => {
    const vipRef = ref(db, 'allowedTeams');
    const unsubscribe = onValue(vipRef, (snapshot) => {
      if (snapshot.exists()) {
        setAllowedTeams(snapshot.val());
      } else {
        setAllowedTeams({});
      }
      setIsLoaded(true);
    });
    return () => unsubscribe();
  }, []);

  // 新しいチームを追加する処理
  const handleAddTeam = () => {
    const formatId = newTeamId.trim().toLowerCase();
    
    if (!formatId) return;
    if (!/^[a-z0-9_-]+$/.test(formatId)) {
      alert("チームIDは「半角の英字・数字・ハイフン・アンダーバー」のみ使用できます。");
      return;
    }
    if (allowedTeams[formatId]) {
      alert("そのチームIDはすでに登録されています！");
      return;
    }

    // データベースに登録
    set(ref(db, `allowedTeams/${formatId}`), true)
      .then(() => {
        setNewTeamId(""); // 入力欄を空にする
        alert(`チーム「${formatId}」をVIPリストに追加しました！\n専用URLは ?id=${formatId} です。`);
      })
      .catch((error) => {
        alert("追加に失敗しました: " + error.message);
      });
  };

  // チームを削除（利用停止）する処理
  const handleRemoveTeam = (teamId) => {
    if (window.confirm(`本当に「${teamId}」の利用を停止しますか？\n※これを消すと、対象チームのメンバーはアプリを開けなくなります。`)) {
      remove(ref(db, `allowedTeams/${teamId}`))
        .then(() => {
          alert(`「${teamId}」を削除しました。`);
        })
        .catch((error) => {
          alert("削除に失敗しました: " + error.message);
        });
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9', padding: '20px', fontFamily: 'sans-serif', color: '#334155' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        
        {/* ヘッダー */}
        <div style={{ backgroundColor: '#0f172a', padding: '20px', color: '#ffffff', textAlign: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '20px', letterSpacing: '1px' }}>👑 FC MANAGER - MASTER</h1>
          <p style={{ margin: '5px 0 0', fontSize: '12px', opacity: 0.7 }}>クラブ量産・VIPリスト管理システム</p>
        </div>

        <div style={{ padding: '20px' }}>
          {/* 追加フォーム */}
          <div style={{ marginBottom: '30px', padding: '15px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <h2 style={{ marginTop: 0, fontSize: '16px', color: '#0f172a' }}>➕ 新しいチームを発行する</h2>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                placeholder="新しいURL用のID (例: tokyo-fc)"
                value={newTeamId}
                onChange={(e) => setNewTeamId(e.target.value)}
                style={{ flex: 1, padding: '10px', fontSize: '16px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
              />
              <button
                onClick={handleAddTeam}
                style={{ padding: '10px 20px', backgroundColor: '#3b82f6', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                登録
              </button>
            </div>
            <p style={{ margin: '8px 0 0', fontSize: '11px', color: '#64748b' }}>※半角英数字、ハイフン、アンダーバーのみ。URLの末尾になります。</p>
          </div>

          {/* 登録済み一覧 */}
          <div>
            <h2 style={{ fontSize: '16px', color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', marginBottom: '15px' }}>
              📋 登録済みチーム一覧 ({Object.keys(allowedTeams).length} クラブ)
            </h2>
            
            {!isLoaded ? (
              <p style={{ textAlign: 'center', color: '#94a3b8' }}>読み込み中...</p>
            ) : Object.keys(allowedTeams).length === 0 ? (
              <p style={{ textAlign: 'center', color: '#94a3b8' }}>登録されているチームはありません。</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {Object.keys(allowedTeams).map((teamId) => (
                  <li key={teamId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 15px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', marginBottom: '8px' }}>
                    
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#0f172a' }}>{teamId}</div>
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                        URL: ?id={teamId}
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveTeam(teamId)}
                      style={{ padding: '6px 12px', backgroundColor: '#ef4444', color: '#ffffff', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      削除
                    </button>

                  </li>
                ))}
              </ul>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
