# Nexora Experience Points (XP) & Level Progression System

## 1. Core Principles

The Nexora gamification system is designed with three immutable rules:
1. **Evidence-Grounded**: Points are awarded strictly for authentic student accomplishments (compiling working code, completing full mock interviews, finishing structured study tasks).
2. **Auditable Transaction Ledger**: Every point awarded is backed by an immutable ledger entry with a specific source, reference ID, and UTC timestamp.
3. **Transparent Quadratic Scaling**: Level progression scales smoothly without pay-to-win mechanics or synthetic daily inflation.

---

## 2. XP Reward Values

| Activity Source | Award Amount | Qualification Criteria |
| :--- | :--- | :--- |
| **CodeLab Solve** | `+50 XP` | First accepted solution (`verdict === 'accepted'`) for any unique problem. Re-submissions do not award duplicate solve XP. |
| **Daily Challenge** | `+100 XP` | Accepted solution for the active daily challenge within its UTC calendar day. |
| **Weekly Challenge** | `+250 XP` | Accepted solution for the designated weekly challenge within the active week. |
| **Mock Interview** | `+75 XP` | Completed interview session with full answer submissions across all stages. |
| **Study Plan Task** | `+25 XP` | Verified completion of a scheduled daily study task (problem solve or concept review). |
| **Consistency Streak** | `+100 XP` | Achieving milestone consistency thresholds (e.g., 7-day active streak). |

---

## 3. Quadratic Level Formula

To prevent rapid level cap exhaustion while providing immediate positive reinforcement for beginners, level thresholds follow a quadratic progression curve:

$$\text{Threshold}(L) = 50 \times (L - 1) \times L$$

### Progression Table (Levels 1–15)

| Level | Required Cumulative XP | XP in Level | Engineering Honor Title |
| :---: | :---: | :---: | :--- |
| **1** | 0 XP | 100 XP | Novice Coder |
| **2** | 100 XP | 200 XP | Junior Problem Solver |
| **3** | 300 XP | 300 XP | Junior Problem Solver |
| **4** | 600 XP | 400 XP | Algorithmic Explorer |
| **5** | 1,000 XP | 500 XP | Algorithmic Explorer |
| **6** | 1,500 XP | 600 XP | Algorithmic Explorer |
| **7** | 2,100 XP | 700 XP | CodeLab Specialist |
| **8** | 2,800 XP | 800 XP | CodeLab Specialist |
| **9** | 3,600 XP | 900 XP | CodeLab Specialist |
| **10** | 4,500 XP | 1,000 XP | Interview-Ready Engineer |
| **11** | 5,500 XP | 1,100 XP | Interview-Ready Engineer |
| **12** | 6,600 XP | 1,200 XP | Interview-Ready Engineer |
| **13** | 7,800 XP | 1,300 XP | Interview-Ready Engineer |
| **14** | 9,100 XP | 1,400 XP | Interview-Ready Engineer |
| **15+** | 10,500+ XP | 1,500+ XP | Master Software Engineer |

---

## 4. Client-Side Integrity & Server Security

1. **Transaction Deduplication**: Each transaction ID is formatted as `${source}_${referenceId}`. The engine verifies set membership before pushing to the ledger.
2. **Database Hardening**: Student gamification documents are stored at `/users/{userId}/gamification/summary` and `/users/{userId}/gamification/transactions/{txId}`.
3. Firestore security rules strictly require authentication (`request.auth.uid == userId`) and block manual administrative tampering.
