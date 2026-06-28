'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

// Types
interface User {
  id: number;
  name: string;
  email: string;
}

interface Group {
  id: number;
  name: string;
}

interface Expense {
  id: number;
  description: string;
  amount: number;
  currency: string;
  date: string;
  split_type: string;
  paid_by: string;
  paid_by_id: number;
}

interface Balance {
  user_id: number;
  name: string;
  is_owed: boolean;
  amount: number;
}

interface DetailedBalances {
  total_owed: number;
  total_owed_to_me: number;
  expenses_i_paid: Array<{
    expense_id: number;
    description: string;
    date: string;
    amount: number;
    owed_by: string;
    total_expense: number;
  }>;
  expenses_i_owe: Array<{
    expense_id: number;
    description: string;
    date: string;
    amount: number;
    paid_by: string;
    total_expense: number;
  }>;
}

interface Settlement {
  id: number;
  from_user: string;
  to_user: string;
  amount: number;
  date: string;
  note: string;
}

interface Member {
  user_id: number;
  name: string;
  email: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [currentGroupId, setCurrentGroupId] = useState<string>('');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [detailedBalances, setDetailedBalances] = useState<DetailedBalances | null>(null);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [activeTab, setActiveTab] = useState('expenses');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Modal states
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showSettlementModal, setShowSettlementModal] = useState(false);
  
  const [expenseForm, setExpenseForm] = useState({
    description: '',
    amount: '',
    currency: 'INR',
    date: new Date().toISOString().split('T')[0],
    splitType: 'equal',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userData);
    loadGroups();
  }, [router]);

  const apiCall = async (endpoint: string, options: any = {}) => {
  try {
    const response = await axios(`/api${endpoint}`, {
      withCredentials: true,
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      ...options,
      data: options.body
    });
    return response.data;
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      router.push('/login');
    }
    throw error;
  }
};

  const loadGroups = async () => {
    try {
      const data = await apiCall('/groups');
      setGroups(data);
      if (data.length > 0) {
        setCurrentGroupId(data[0].id);
        await loadGroupData(data[0].id);
      }
    } catch (error) {
      console.error('Error loading groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadGroupData = async (groupId: string) => {
    setLoading(true);
    try {
      await Promise.all([
        loadExpenses(groupId),
        loadBalances(groupId),
        loadSettlements(groupId),
        loadMembers(groupId)
      ]);
    } catch (error) {
      console.error('Error loading group data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadExpenses = async (groupId: string) => {
    const data = await apiCall(`/groups/${groupId}/expenses`);
    setExpenses(data);
  };

  const loadBalances = async (groupId: string) => {
    const data = await apiCall(`/groups/${groupId}/balances`);
    setBalances(data);
    const detailed = await apiCall(`/groups/${groupId}/detailed-balances`);
    setDetailedBalances(detailed);
  };

  const loadSettlements = async (groupId: string) => {
    const data = await apiCall(`/groups/${groupId}/settlements`);
    setSettlements(data);
  };

  const loadMembers = async (groupId: string) => {
    const data = await apiCall(`/groups/${groupId}/members`);
    setMembers(data);
  };

  const handleGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const groupId = e.target.value;
    setCurrentGroupId(groupId);
    if (groupId) {
      loadGroupData(groupId);
    }
  };

  const handleCreateGroup = async () => {
    const name = prompt('Enter group name:');
    if (name) {
      await apiCall('/groups', { method: 'POST', body: { name } });
      await loadGroups();
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(expenseForm.amount);
    const membersList = members;

    let splits = [];
    if (expenseForm.splitType === 'equal') {
      const perPerson = amount / membersList.length;
      splits = membersList.map(m => ({ user_id: m.user_id, amount: perPerson }));
    } else {
      // Custom split - get values from form
      const splitInputs = document.querySelectorAll('.split-input-value');
      let totalSplit = 0;
      splits = [];
      splitInputs.forEach((input: any, index) => {
        const val = parseFloat(input.value);
        if (val) {
          splits.push({ user_id: membersList[index].user_id, amount: val });
          totalSplit += val;
        }
      });
      if (Math.abs(totalSplit - amount) > 0.01) {
        alert('Split amounts must sum to the total expense');
        return;
      }
    }

    try {
      await apiCall(`/groups/${currentGroupId}/expenses`, {
        method: 'POST',
        body: {
          description: expenseForm.description,
          amount: amount,
          currency: expenseForm.currency,
          date: expenseForm.date,
          split_type: expenseForm.splitType,
          paid_by_id: user?.id,
          splits: splits
        }
      });
      setShowExpenseModal(false);
      setExpenseForm({
        description: '',
        amount: '',
        currency: 'INR',
        date: new Date().toISOString().split('T')[0],
        splitType: 'equal',
      });
      await loadGroupData(currentGroupId);
    } catch (error: any) {
      alert('Error adding expense: ' + error.message);
    }
  };

  const handleAddMember = async () => {
    const email = (document.getElementById('newMemberEmail') as HTMLInputElement).value;
    if (email) {
      await apiCall(`/groups/${currentGroupId}/members`, {
        method: 'POST',
        body: { email }
      });
      (document.getElementById('newMemberEmail') as HTMLInputElement).value = '';
      await loadMembers(currentGroupId);
    }
  };

  const handleRemoveMember = async (userId: number) => {
    if (confirm('Remove this member?')) {
      await apiCall(`/groups/${currentGroupId}/members/${userId}`, { method: 'DELETE' });
      await loadMembers(currentGroupId);
    }
  };

  const handleSettleUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const fromUserId = parseInt((document.getElementById('settlementFrom') as HTMLSelectElement).value);
    const toUserId = parseInt((document.getElementById('settlementTo') as HTMLSelectElement).value);
    const amount = parseFloat((document.getElementById('settlementAmount') as HTMLInputElement).value);
    const note = (document.getElementById('settlementNote') as HTMLInputElement).value;

    if (fromUserId === toUserId) {
      alert('Cannot settle with yourself');
      return;
    }

    try {
      await apiCall(`/groups/${currentGroupId}/settlements`, {
        method: 'POST',
        body: { from_user_id: fromUserId, to_user_id: toUserId, amount, note }
      });
      setShowSettlementModal(false);
      await loadGroupData(currentGroupId);
    } catch (error: any) {
      alert('Error recording settlement: ' + error.message);
    }
  };

  const handleImportCSV = async () => {
    const fileInput = document.getElementById('csvFile') as HTMLInputElement;
    const file = fileInput.files?.[0];
    if (!file) {
      alert('Please select a CSV file');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`/api/groups/${currentGroupId}/import`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      const result = await response.json();
      
      const progressDiv = document.getElementById('importProgress');
      if (progressDiv) {
        progressDiv.innerHTML = `<p>✅ Found ${result.anomaly_count} anomalies in ${result.total_rows} rows.</p>`;
      }

      // Load anomalies
      const anomaliesRes = await fetch(`/api/import/anomalies/${result.session_id}`, {
        credentials: 'include'
      });
      const anomaliesData = await anomaliesRes.json();
      
      // Display anomalies
      const anomaliesList = document.getElementById('anomaliesList');
      if (anomaliesList && anomaliesData.length > 0) {
        anomaliesList.innerHTML = '<h4>⚠️ Detected Issues - Please Review:</h4>';
        for (const anomaly of anomaliesData) {
          const div = document.createElement('div');
          div.className = 'anomaly-item';
          div.innerHTML = `
            <div class="anomaly-type">⚠️ ${anomaly.type.replace(/_/g, ' ')} at row ${anomaly.row_number}</div>
            <div class="anomaly-desc">${anomaly.description}</div>
            <div class="anomaly-resolution">Proposed: ${anomaly.resolution_action}</div>
            <div class="anomaly-buttons">
              <button class="btn btn-success approve-btn" data-id="${anomaly.id}">Approve</button>
              <button class="btn btn-danger reject-btn" data-id="${anomaly.id}">Reject</button>
            </div>
          `;
          anomaliesList.appendChild(div);
        }

        // Add event listeners
        document.querySelectorAll('.approve-btn').forEach(btn => {
          btn.addEventListener('click', async (e) => {
            const id = (e.target as HTMLButtonElement).dataset.id;
            await fetch(`/api/import/anomalies/${id}/approve`, {
              method: 'POST',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ approved: true })
            });
            (e.target as HTMLButtonElement).closest('.anomaly-item')?.remove();
            await loadGroupData(currentGroupId);
          });
        });

        document.querySelectorAll('.reject-btn').forEach(btn => {
          btn.addEventListener('click', async (e) => {
            const id = (e.target as HTMLButtonElement).dataset.id;
            await fetch(`/api/import/anomalies/${id}/reject`, {
              method: 'DELETE',
              credentials: 'include'
            });
            (e.target as HTMLButtonElement).closest('.anomaly-item')?.remove();
          });
        });
      }
    } catch (error: any) {
      alert('Error importing: ' + error.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (loading) {
    return <div className="app-container" style={{ color: 'white', textAlign: 'center', padding: '40px' }}>Loading...</div>;
  }

  return (
    <div className="app-container">
      <header>
        <h1>🏠 FlatMate Expenses</h1>
        <div className="user-info">
          <span>👤 {user?.name}</span>
          <button className="btn-logout" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <div className="group-header">
        <select className="group-select" value={currentGroupId} onChange={handleGroupChange}>
          <option value="">Select a group</option>
          {groups.map(g => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
        <button className="btn btn-secondary" onClick={handleCreateGroup}>+ New Group</button>
      </div>

      {currentGroupId && (
        <>
          <div className="tabs">
            <button className={`tab-btn ${activeTab === 'expenses' ? 'active' : ''}`} onClick={() => setActiveTab('expenses')}>Expenses</button>
            <button className={`tab-btn ${activeTab === 'balances' ? 'active' : ''}`} onClick={() => setActiveTab('balances')}>Balances</button>
            <button className={`tab-btn ${activeTab === 'settlements' ? 'active' : ''}`} onClick={() => setActiveTab('settlements')}>Settlements</button>
            <button className={`tab-btn ${activeTab === 'import' ? 'active' : ''}`} onClick={() => setActiveTab('import')}>Import CSV</button>
            <button className={`tab-btn ${activeTab === 'members' ? 'active' : ''}`} onClick={() => setActiveTab('members')}>Members</button>
          </div>

          {/* Expenses Tab */}
          <div className={`tab-content ${activeTab === 'expenses' ? 'active' : ''}`}>
            <button className="btn btn-primary add-btn" onClick={() => setShowExpenseModal(true)}>+ Add Expense</button>
            <div className="expenses-list">
              {expenses.length === 0 ? (
                <p>No expenses yet. Add one!</p>
              ) : (
                expenses.map(exp => (
                  <div key={exp.id} className="expense-item">
                    <div className="expense-left">
                      <div className="expense-desc">{exp.description}</div>
                      <div className="expense-meta">{new Date(exp.date).toLocaleDateString()} • {exp.split_type}</div>
                    </div>
                    <div className="expense-right">
                      <div className="expense-amount">{exp.currency === 'USD' ? '$' : '₹'}{exp.amount.toFixed(2)}</div>
                      <div className="expense-paid-by">Paid by {exp.paid_by}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Balances Tab */}
          <div className={`tab-content ${activeTab === 'balances' ? 'active' : ''}`}>
            <div className="balance-summary">
              {balances.length === 0 ? (
                <p>No outstanding balances. Everyone is settled up!</p>
              ) : (
                balances.map(b => (
                  <div key={b.user_id} className={`balance-card ${b.is_owed ? 'is-owed' : 'owed'}`}>
                    <div className="balance-name">{b.name}</div>
                    <div className={`balance-amount ${b.is_owed ? 'positive' : 'negative'}`}>
                      {b.is_owed ? 'Owes you' : 'You owe'} ₹{b.amount.toFixed(2)}
                    </div>
                  </div>
                ))
              )}
            </div>

            {detailedBalances && (
              <div className="detailed-breakdown">
                <h3>📊 Your Detailed Breakdown</h3>
                <div className="breakdown-section">
                  <h4>📤 You owe: ₹{detailedBalances.total_owed?.toFixed(2) || '0.00'}</h4>
                  {detailedBalances.expenses_i_owe?.length > 0 ? (
                    detailedBalances.expenses_i_owe.map((e, i) => (
                      <div key={i} className="breakdown-item">
                        <span>{e.description} ({new Date(e.date).toLocaleDateString()})</span>
                        <span>₹{e.amount.toFixed(2)} to {e.paid_by}</span>
                      </div>
                    ))
                  ) : (
                    <p>No outstanding debts</p>
                  )}
                </div>
                <div className="breakdown-section">
                  <h4>📥 Others owe you: ₹{detailedBalances.total_owed_to_me?.toFixed(2) || '0.00'}</h4>
                  {detailedBalances.expenses_i_paid?.length > 0 ? (
                    detailedBalances.expenses_i_paid.map((e, i) => (
                      <div key={i} className="breakdown-item">
                        <span>{e.description} ({new Date(e.date).toLocaleDateString()})</span>
                        <span>₹{e.amount.toFixed(2)} from {e.owed_by}</span>
                      </div>
                    ))
                  ) : (
                    <p>No one owes you</p>
                  )}
                </div>
                <button className="btn btn-success" onClick={() => setShowSettlementModal(true)}>💰 Record Settlement</button>
              </div>
            )}
          </div>

          {/* Settlements Tab */}
          <div className={`tab-content ${activeTab === 'settlements' ? 'active' : ''}`}>
            <div className="settlements-list">
              {settlements.length === 0 ? (
                <p>No settlements recorded yet.</p>
              ) : (
                settlements.map(s => (
                  <div key={s.id} className="settlement-item">
                    <div className="settlement-detail">
                      {s.from_user} paid {s.to_user}
                      {s.note && ` (${s.note})`}
                    </div>
                    <div className="settlement-amount">₹{s.amount.toFixed(2)}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Import Tab */}
          <div className={`tab-content ${activeTab === 'import' ? 'active' : ''}`}>
            <div className="import-section">
              <h3>📤 Import Expenses from CSV</h3>
              <p>Upload your <code>expenses_export.csv</code> file. The system will detect anomalies and ask for your approval.</p>
              <input type="file" id="csvFile" accept=".csv" style={{ margin: '16px 0', display: 'block', marginLeft: 'auto', marginRight: 'auto' }} />
              <button className="btn btn-primary" onClick={handleImportCSV}>Upload & Detect Anomalies</button>
              <div id="importProgress" className="import-progress"></div>
              <div id="anomaliesList" className="anomalies-list"></div>
            </div>
          </div>

          {/* Members Tab */}
          <div className={`tab-content ${activeTab === 'members' ? 'active' : ''}`}>
            <div className="members-section">
              <h3>👥 Group Members</h3>
              <div className="members-list">
                {members.map(m => (
                  <div key={m.user_id} className="member-item">
                    <span className="member-name">{m.name}</span>
                    {m.user_id !== user?.id && (
                      <button className="remove-member" onClick={() => handleRemoveMember(m.user_id)}>×</button>
                    )}
                  </div>
                ))}
              </div>
              <div className="add-member">
                <input type="email" id="newMemberEmail" placeholder="Member email" />
                <button className="btn btn-secondary" onClick={handleAddMember}>Add Member</button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Add Expense Modal */}
      <div className="modal" style={{ display: showExpenseModal ? 'block' : 'none' }}>
        <div className="modal-content">
          <span className="close" onClick={() => setShowExpenseModal(false)}>&times;</span>
          <h2>Add Expense</h2>
          <form onSubmit={handleAddExpense}>
            <div className="form-group">
              <input
                type="text"
                placeholder="Description"
                value={expenseForm.description}
                onChange={(e) => setExpenseForm({...expenseForm, description: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="number"
                placeholder="Amount"
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})}
                step="0.01"
                required
              />
            </div>
            <div className="form-group">
              <select
                value={expenseForm.currency}
                onChange={(e) => setExpenseForm({...expenseForm, currency: e.target.value})}
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
              </select>
            </div>
            <div className="form-group">
              <input
                type="date"
                value={expenseForm.date}
                onChange={(e) => setExpenseForm({...expenseForm, date: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <select
                value={expenseForm.splitType}
                onChange={(e) => setExpenseForm({...expenseForm, splitType: e.target.value})}
              >
                <option value="equal">Equal Split</option>
                <option value="custom">Custom Split</option>
              </select>
            </div>
            {expenseForm.splitType === 'custom' && (
              <div className="form-group">
                {members.map(m => (
                  <div key={m.user_id} style={{ marginBottom: '8px' }}>
                    <label>{m.name}</label>
                    <input
                      type="number"
                      className="split-input-value"
                      placeholder="Amount"
                      step="0.01"
                      style={{ marginTop: '4px' }}
                    />
                  </div>
                ))}
              </div>
            )}
            <button type="submit" className="btn btn-primary">Add Expense</button>
          </form>
        </div>
      </div>

      {/* Settlement Modal */}
      <div className="modal" style={{ display: showSettlementModal ? 'block' : 'none' }}>
        <div className="modal-content">
          <span className="close" onClick={() => setShowSettlementModal(false)}>&times;</span>
          <h2>Record Settlement</h2>
          <form onSubmit={handleSettleUp}>
            <div className="form-group">
              <select id="settlementFrom" required>
                <option value="">Who paid?</option>
                {members.filter(m => m.user_id !== user?.id).map(m => (
                  <option key={m.user_id} value={m.user_id}>{m.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <select id="settlementTo" required>
                <option value="">Who received payment?</option>
                {members.filter(m => m.user_id !== user?.id).map(m => (
                  <option key={m.user_id} value={m.user_id}>{m.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <input
                type="number"
                id="settlementAmount"
                placeholder="Amount"
                step="0.01"
                required
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                id="settlementNote"
                placeholder="Note (optional)"
              />
            </div>
            <button type="submit" className="btn btn-primary">Record</button>
          </form>
        </div>
      </div>
    </div>
  );
}