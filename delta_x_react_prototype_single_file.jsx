/*
DeltaX - React Prototype (single-file)

How to use:
1) Create a new Vite React app (recommended):
   npm create vite@latest deltax -- --template react
   cd deltax
2) Install dependencies (Tailwind optional but used in classes here):
   npm install
3) Configure Tailwind (optional). If you don't want Tailwind, classes are readable but may not render exactly.
4) Replace src/App.jsx with this file's content and start: npm run dev

This single-file prototype implements a desktop-focused layout with 4 screens:
- Lead Listing
- Lead Details
- Lead Management (rule builder placeholder)
- Dashboard

It's intentionally self-contained and uses React state for data; no backend.

Notes:
- This is a prototype: persistence, authentication, real-time, and integrations are stubs.
- You can extend by extracting components and connecting to an API.
*/

import React, { useState, useMemo } from 'react'

const initialLeads = [
  { id: 1, name: 'Jonathon Bechhofer', phone: '838388717', email: 'jon@example.com', source: 'Website', assignedTo: 'Amit', status: 'New', createdAt: '2025-12-01', lastContacted: null, tags: ['interested'], notes: [] },
  { id: 2, name: 'Sara Khan', phone: '9988776655', email: 'sara@domain.com', source: 'Facebook', assignedTo: 'Priya', status: 'Contacted', createdAt: '2025-11-28', lastContacted: '2025-11-29', tags: ['priority'], notes: [{text:'Called, interested in test drive', date:'2025-11-29'}] },
  { id: 3, name: 'Ravi Gupta', phone: '7776665554', email: 'ravi@ex.com', source: 'Twitter', assignedTo: null, status: 'New', createdAt: '2025-12-03', lastContacted: null, tags: [], notes: [] },
]

const STATUS_OPTIONS = ['New','Contacted','Qualified','Not Interested','Closed']
const USERS = ['Amit','Priya','Rohit','Unassigned']

function TopNav({onCreate, search, setSearch}){
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white shadow-sm">
      <div className="flex items-center gap-4">
        <div className="text-xl font-bold">DeltaX</div>
        <div className="hidden md:block text-sm text-gray-600">Lead Management for HSR Motors</div>
      </div>
      <div className="flex items-center gap-3">
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search leads..." className="border rounded px-2 py-1" />
        <button onClick={onCreate} className="px-3 py-1 bg-blue-600 text-white rounded">New Lead</button>
      </div>
    </div>
  )
}

function LeftNav({view,setView}){
  return (
    <div className="w-56 bg-gray-50 min-h-screen p-4">
      <nav className="flex flex-col gap-2">
        <button onClick={()=>setView('dashboard')} className={`text-left p-2 rounded ${view==='dashboard'?'bg-blue-100':''}`}>Dashboard</button>
        <button onClick={()=>setView('list')} className={`text-left p-2 rounded ${view==='list'?'bg-blue-100':''}`}>Leads</button>
        <button onClick={()=>setView('management')} className={`text-left p-2 rounded ${view==='management'?'bg-blue-100':''}`}>Lead Management</button>
        <button onClick={()=>setView('details')} className={`text-left p-2 rounded ${view==='details'?'bg-blue-100':''}`}>Sample Detail</button>
        <div className="mt-6 text-xs text-gray-500">Users</div>
        {USERS.map(u => <div key={u} className="text-sm">{u}</div>)}
      </nav>
    </div>
  )
}

function KPI({title,value,children}){
  return (
    <div className="bg-white p-4 rounded shadow-sm w-48">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-bold">{value}</div>
      {children}
    </div>
  )
}

function Dashboard({leads}){
  const total = leads.length
  const newToday = leads.filter(l => l.status==='New').length
  const contacted = leads.filter(l => l.status==='Contacted').length
  const qualified = leads.filter(l => l.status==='Qualified').length

  // simple source breakdown
  const bySource = leads.reduce((acc,l)=>{ acc[l.source] = (acc[l.source]||0)+1; return acc },{})

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Dashboard</h2>
      <div className="flex gap-4 mb-6">
        <KPI title="Total Leads" value={total} />
        <KPI title="New" value={newToday} />
        <KPI title="Contacted" value={contacted} />
        <KPI title="Qualified" value={qualified} />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded shadow-sm">
          <div className="font-semibold mb-3">Leads by Source</div>
          <ul className="space-y-2">
            {Object.entries(bySource).map(([k,v]) => (
              <li key={k} className="flex justify-between"><span>{k}</span><span>{v}</span></li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-4 rounded shadow-sm">
          <div className="font-semibold mb-3">Recent Activity</div>
          <div className="text-sm text-gray-600">No external integrations in prototype. Activities come from local state actions.</div>
        </div>
      </div>
    </div>
  )
}

function LeadRow({lead,onOpen,onQuickStatus}){
  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="px-3 py-2"><input type="checkbox" /></td>
      <td className="px-3 py-2 cursor-pointer" onClick={()=>onOpen(lead)}>{lead.name}</td>
      <td className="px-3 py-2">{lead.phone}</td>
      <td className="px-3 py-2">{lead.source}</td>
      <td className="px-3 py-2">{lead.assignedTo || 'Unassigned'}</td>
      <td className="px-3 py-2">{lead.status}</td>
      <td className="px-3 py-2">
        <select value={lead.status} onChange={(e)=>onQuickStatus(lead,e.target.value)}>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </td>
    </tr>
  )
}

function LeadList({leads,setLeads,onOpen}){
  const [filter, setFilter] = useState({status:'',source:'',assigned:''})

  function quickStatus(lead,newStatus){
    setLeads(prev => prev.map(l=> l.id===lead.id?{...l,status:newStatus}:l))
  }

  const filtered = leads.filter(l=>{
    if(filter.status && l.status!==filter.status) return false
    if(filter.source && l.source!==filter.source) return false
    if(filter.assigned && ((l.assignedTo||'Unassigned')!==filter.assigned)) return false
    return true
  })

  const sources = Array.from(new Set(leads.map(l=>l.source)))

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Leads</h2>
      <div className="flex gap-3 mb-4">
        <select value={filter.status} onChange={e=>setFilter({...filter,status:e.target.value})} className="border rounded px-2 py-1">
          <option value="">All Status</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filter.source} onChange={e=>setFilter({...filter,source:e.target.value})} className="border rounded px-2 py-1">
          <option value="">All Sources</option>
          {sources.map(s=> <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filter.assigned} onChange={e=>setFilter({...filter,assigned:e.target.value})} className="border rounded px-2 py-1">
          <option value="">All Reps</option>
          {USERS.map(u=> <option key={u} value={u}>{u}</option>)}
        </select>
      </div>

      <div className="bg-white rounded shadow-sm overflow-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-2"> </th>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Phone</th>
              <th className="px-3 py-2">Source</th>
              <th className="px-3 py-2">Assigned</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Quick</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(l => <LeadRow key={l.id} lead={l} onOpen={onOpen} onQuickStatus={quickStatus} />)}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function LeadDetails({lead,onUpdate}){
  const [note, setNote] = useState('')
  if(!lead) return <div className="p-6">Select a lead to see details.</div>

  function addNote(){
    if(!note.trim()) return
    onUpdate(lead.id, { notes: [...lead.notes, {text:note,date: new Date().toISOString().slice(0,10)}], lastContacted: new Date().toISOString().slice(0,10) })
    setNote('')
  }

  function changeAssigned(e){
    onUpdate(lead.id, { assignedTo: e.target.value === 'Unassigned' ? null : e.target.value })
  }

  function changeStatus(e){
    onUpdate(lead.id, { status: e.target.value })
  }

  return (
    <div className="p-6 grid grid-cols-3 gap-6">
      <div className="col-span-2 bg-white p-4 rounded shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-semibold">{lead.name}</h3>
            <div className="text-sm text-gray-600">{lead.phone} • {lead.email}</div>
            <div className="text-xs mt-2">Source: {lead.source} • Created: {lead.createdAt}</div>
          </div>
          <div className="text-right">
            <div className="text-sm">Status</div>
            <select value={lead.status} onChange={changeStatus} className="border rounded px-2 py-1">
              {STATUS_OPTIONS.map(s=> <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <h4 className="font-semibold">Timeline</h4>
          <div className="space-y-3 mt-2">
            {lead.notes.length===0 ? <div className="text-sm text-gray-500">No activities yet.</div> : lead.notes.map((n,idx)=> (
              <div key={idx} className="border rounded p-2">
                <div className="text-sm">{n.text}</div>
                <div className="text-xs text-gray-500">{n.date}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="Add call note or activity" className="w-full border rounded p-2" />
          <div className="flex gap-2 mt-2">
            <button onClick={addNote} className="px-3 py-1 bg-green-600 text-white rounded">Add Note</button>
            <button onClick={()=>onUpdate(lead.id,{status:'Contacted'})} className="px-3 py-1 bg-blue-600 text-white rounded">Mark Contacted</button>
          </div>
        </div>
      </div>

      <aside className="bg-white p-4 rounded shadow-sm">
        <div className="mb-3">
          <div className="text-sm text-gray-500">Assign to</div>
          <select value={lead.assignedTo||'Unassigned'} onChange={changeAssigned} className="border rounded px-2 py-1 w-full">
            {USERS.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>

        <div className="mb-3">
          <div className="text-sm text-gray-500">Tags</div>
          <div className="flex gap-2 mt-2 flex-wrap">
            {(lead.tags || []).map((t,i)=> <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded">{t}</span>)}
          </div>
        </div>

        <div>
          <div className="text-sm text-gray-500">Quick Actions</div>
          <div className="flex flex-col gap-2 mt-2">
            <button className="px-2 py-1 border rounded">Schedule Follow-up</button>
            <button className="px-2 py-1 border rounded">Send SMS</button>
            <button className="px-2 py-1 border rounded">Send Email</button>
          </div>
        </div>
      </aside>
    </div>
  )
}

function Management({leads,setLeads}){
  const [rules, setRules] = useState([])
  const [newRule, setNewRule] = useState({source:'',action:'Assign to Amit'})

  function addRule(){
    setRules(prev=>[...prev,{...newRule,id:Date.now()}])
    setNewRule({source:'',action:'Assign to Amit'})
  }

  function runRules(){
    // very simple: if lead.source===rule.source, assign
    setLeads(prev => prev.map(l=>{
      let copy = {...l}
      rules.forEach(r => {
        if(r.source && l.source===r.source){
          if(r.action.startsWith('Assign to ')) copy.assignedTo = r.action.replace('Assign to ','')
          if(r.action.startsWith('Status ')) copy.status = r.action.replace('Status ','')
        }
      })
      return copy
    }))
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Lead Management</h2>
      <div className="bg-white p-4 rounded shadow-sm mb-6">
        <div className="flex gap-2 items-center">
          <input placeholder="Source (e.g., Facebook)" value={newRule.source} onChange={e=>setNewRule({...newRule,source:e.target.value})} className="border px-2 py-1" />
          <select value={newRule.action} onChange={e=>setNewRule({...newRule,action:e.target.value})} className="border px-2 py-1">
            <option>Assign to Amit</option>
            <option>Assign to Priya</option>
            <option>Status Contacted</option>
            <option>Status Qualified</option>
          </select>
          <button onClick={addRule} className="px-3 py-1 bg-blue-600 text-white rounded">Add Rule</button>
        </div>
      </div>

      <div className="mb-4">
        <div className="font-semibold mb-2">Active Rules</div>
        <ul className="space-y-2">
          {rules.map(r=> <li key={r.id} className="bg-white p-2 rounded shadow-sm flex justify-between">If Source is <strong>{r.source}</strong> → <em>{r.action}</em></li>)}
        </ul>
      </div>

      <div>
        <button onClick={runRules} className="px-3 py-1 bg-green-600 text-white rounded">Run Rules Now</button>
      </div>
    </div>
  )
}

export default function App(){
  const [view, setView] = useState('dashboard')
  const [leads, setLeads] = useState(initialLeads)
  const [selectedLeadId, setSelectedLeadId] = useState(leads[0]?.id || null)
  const [search, setSearch] = useState('')

  function createLead(){
    const id = Date.now()
    const newLead = { id, name: 'New Lead ' + id, phone:'', email:'', source:'Website', assignedTo:null, status:'New', createdAt: new Date().toISOString().slice(0,10), notes:[] }
    setLeads(prev=>[newLead,...prev])
    setSelectedLeadId(id)
    setView('details')
  }

  function openLead(lead){
    setSelectedLeadId(lead.id)
    setView('details')
  }

  function updateLead(id, changes){
    setLeads(prev => prev.map(l=> l.id===id?{...l,...changes}:l))
  }

  const selectedLead = leads.find(l=>l.id===selectedLeadId)

  const filteredLeads = useMemo(()=>{
    if(!search) return leads
    const q = search.toLowerCase()
    return leads.filter(l => l.name.toLowerCase().includes(q) || (l.phone||'').includes(q) || (l.email||'').includes(q))
  },[leads,search])

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-sm">
      <div className="flex">
        <LeftNav view={view} setView={setView} />
        <div className="flex-1">
          <TopNav onCreate={createLead} search={search} setSearch={setSearch} />

          <div>
            {view==='dashboard' && <Dashboard leads={leads} />}
            {view==='list' && <LeadList leads={filteredLeads} setLeads={setLeads} onOpen={openLead} />}
            {view==='details' && <LeadDetails lead={selectedLead} onUpdate={updateLead} />}
            {view==='management' && <Management leads={leads} setLeads={setLeads} />}
          </div>
        </div>
      </div>
    </div>
  )
}
