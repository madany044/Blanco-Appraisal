// Single source of truth for the role-based accounts in this app.
// Edit this file to add/remove people — both `npm run db:seed` and
// `npm run auth:invite-links` read from it.

export const USERS = [
  { email: "HR@blanco-sdspl.com", role: "hr", name: "HR Admin" },
  { email: "sudeepmalliger@gmail.com", role: "management", name: "Management" },
  { email: "sudeep.blanco@gmail.com", role: "manager", name: "Sudeep M C" },
  { email: "yogi307902@gmail.com", role: "manager", name: "Yogesha S" },
  { email: "naveengsnandi@gmail.com", role: "manager", name: "Naveena G S" },
  { email: "pradeepshivanna88@gmail.com", role: "manager", name: "Pradeep Kumar B S" },
  { email: "shashishetty236@gmail.com", role: "manager", name: "Shashikumar M S" },
  { email: "kumar.s.malliger@gmail.com", role: "manager", name: "Kumaraswamy M P" },
  { email: "deepu.cgowda@gmail.com", role: "manager", name: "Deepu M C" },
  { email: "dc.blanco@gmail.com", role: "dc", name: "Data Collector" },
] as const;

export const MANAGERS = [
  { name: "Sudeep M C", email: "sudeep.blanco@gmail.com" },
  { name: "Yogesha S", email: "yogi307902@gmail.com" },
  { name: "Naveena G S", email: "naveengsnandi@gmail.com" },
  { name: "Pradeep Kumar B S", email: "pradeepshivanna88@gmail.com" },
  { name: "Shashikumar M S", email: "shashishetty236@gmail.com" },
  { name: "Kumaraswamy M P", email: "kumar.s.malliger@gmail.com" },
  { name: "Deepu M C", email: "deepu.cgowda@gmail.com" },
] as const;
