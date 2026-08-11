# 🛒 Smart Cashier


[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge\&logo=python\&logoColor=white)](https://python.org)
[![React](https://img.shields.io/badge/React-Frontend-61DAFB?style=for-the-badge\&logo=react\&logoColor=black)](https://react.dev)
[![Reinforcement Learning](https://img.shields.io/badge/Reinforcement%20Learning-RL-FF6F00?style=for-the-badge)](https://en.wikipedia.org/wiki/Reinforcement_learning)
[![Q-Learning](https://img.shields.io/badge/Q--Learning-Off--Policy-8E44AD?style=for-the-badge)](https://en.wikipedia.org/wiki/Q-learning)
[![SARSA](https://img.shields.io/badge/SARSA-On--Policy-16A085?style=for-the-badge)](https://en.wikipedia.org/wiki/SARSA_%28algorithm%29)
[![NumPy](https://img.shields.io/badge/NumPy-Scientific%20Computing-013243?style=for-the-badge\&logo=numpy\&logoColor=white)](https://numpy.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

---


### 🤖 Smart Cashier Optimization & Intelligent Queue Management

> **Optimize every queue. Minimize every wait.**
> A Reinforcement Learning-based intelligent cashier system designed to optimize customer distribution across **5 cashiers**. The agent learns to select the most suitable cashier for each incoming customer based on the current queue state, receiving higher rewards as customer waiting time decreases. The project implements and compares **Q-Learning** and **SARSA** to evaluate different learning strategies for intelligent queue optimization.

---

## 📌 Overview

Traditional cashier systems often assign customers randomly or rely on customers choosing a queue themselves. This can result in:

* Uneven customer distribution
* Overloaded queues
* Long waiting times
* Underutilized cashiers
* Poor overall checkout efficiency

This project addresses the problem using **Reinforcement Learning**.

The system simulates a supermarket environment with **5 cashiers** and a continuous stream of incoming customers. At each step, the RL agent observes the current state of the cashier queues and decides which cashier should serve the next customer.

The agent receives a **reward based on customer waiting time**, allowing it to gradually learn a more efficient allocation strategy.

---

## 🎯 Project Objective

The primary objective is to:

> **Minimize customer waiting time by intelligently distributing customers across the five available cashiers.**

The agent learns through repeated interaction with the simulated environment.

As the waiting time decreases:

```text
Lower Waiting Time → Higher Reward
Higher Waiting Time → Lower Reward
```

The learned policy should therefore favor cashier assignments that result in shorter queues and lower overall waiting time.

---

# 🧠 Reinforcement Learning Environment

The cashier allocation problem is modeled as a Markov Decision Process (MDP).

### 👤 Agent

The **RL Agent** is responsible for deciding which cashier should be assigned to each incoming customer.

### 🌍 Environment

The environment represents the checkout system and contains:

* 5 cashiers
* Customer arrivals
* Cashier queues
* Service times
* Customer waiting times
* Reward calculation

### 📊 State

The state represents the current condition of all cashier queues.

For example:

```text
State = [Queue₁, Queue₂, Queue₃, Queue₄, Queue₅]
```

The state changes whenever customers arrive, join queues, or finish being served.

### 🎮 Action

For every incoming customer, the agent selects one of the five cashiers:

```text
Action ∈ {
    Cashier 1,
    Cashier 2,
    Cashier 3,
    Cashier 4,
    Cashier 5
}
```

### 🏆 Reward

The reward function encourages the agent to minimize customer waiting time.

A shorter waiting time results in a higher reward, while longer waiting times result in lower rewards.

This creates the learning objective:

```text
Minimize Waiting Time
          ↓
   Maximize Reward
```

---

# 🔄 Algorithms

## 1. Q-Learning

**Q-Learning** is an **off-policy Reinforcement Learning algorithm**.

It learns the expected long-term value of taking an action in a particular state and aims to discover the optimal policy.

In this project, Q-Learning learns which cashier should be selected for each state to minimize future customer waiting time.

### Why Q-Learning?

Q-Learning is important in this project because:

* It learns an optimal policy.
* It considers long-term future rewards.
* It provides a strong baseline for the cashier allocation problem.
* Its off-policy nature allows it to learn the optimal policy independently of the agent's current behavior.
* It is relatively simple and effective for discrete state/action spaces.

---

## 2. SARSA

**SARSA** is an **on-policy Reinforcement Learning algorithm**.

Unlike Q-Learning, SARSA learns from the actions that the agent actually takes while interacting with the environment.

The name SARSA comes from:

```text
State → Action → Reward → State → Action
```

### Why SARSA?

SARSA is important because:

* It learns the policy actually being followed.
* It takes exploration into account during learning.
* It can produce more conservative behavior during exploration.
* It provides a meaningful comparison against Q-Learning.
* It helps evaluate how on-policy learning performs in the cashier allocation environment.

---

# ⚔️ Q-Learning vs SARSA

| Feature           | Q-Learning                                | SARSA                           |
| ----------------- | ----------------------------------------- | ------------------------------- |
| Learning Type     | Off-Policy                                | On-Policy                       |
| Policy            | Learns optimal policy                     | Learns current behavior policy  |
| Exploration       | Less directly reflected in learned policy | Directly reflected              |
| Main Strength     | Optimization toward optimal policy        | Considers actual behavior       |
| Learning Strategy | Greedy target policy                      | Behavior policy                 |
| Role in Project   | Optimal allocation baseline               | On-policy allocation comparison |

### Why Compare Them?

Using both algorithms allows us to investigate how different Reinforcement Learning strategies affect the cashier allocation problem.

The comparison focuses on whether an **off-policy algorithm (Q-Learning)** or an **on-policy algorithm (SARSA)** can achieve better performance in terms of:

* Waiting time
* Reward
* Queue balance
* Cashier utilization

---

# 🏗️ System Architecture

```text
                  👤 Customer Arrives
                          │
                          ▼
                ┌───────────────────┐
                │   RL Environment  │
                │                   │
                │    5 Cashiers     │
                │    Queue States   │
                └─────────┬─────────┘
                          │
                          ▼
                  ┌──────────────┐
                  │   RL Agent   │
                  └──────┬───────┘
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
       ┌─────────────┐       ┌─────────────┐
       │ Q-Learning  │       │    SARSA    │
       │ Off-Policy  │       │  On-Policy  │
       └──────┬──────┘       └──────┬──────┘
              │                     │
              └──────────┬──────────┘
                         ▼
                  Select Cashier
                         │
                         ▼
                  Customer Served
                         │
                         ▼
                 Calculate Waiting
                         │
                         ▼
                    Get Reward
                         │
                         ▼
                  Update Q-Values
                         │
                         ▼
                   Next Customer
```

---

# 🔁 Training Process

The learning process follows these steps:

1. Initialize the environment.
2. Generate an incoming customer.
3. Observe the current cashier/queue state.
4. Select an action using the RL policy.
5. Assign the customer to one of the five cashiers.
6. Calculate the customer's waiting time.
7. Generate the corresponding reward.
8. Update the Q-values.
9. Move to the next state.
10. Repeat the process for multiple episodes.
11. Evaluate the trained agent.
12. Compare Q-Learning and SARSA.

---

# 📊 Evaluation Metrics

The performance of both algorithms is evaluated using several metrics.

### ⏱️ Average Waiting Time

Measures the average amount of time customers spend waiting.

**Lower is better.**

### 🏆 Average Reward

Measures how effectively the agent achieves its objective.

**Higher is better.**

### 📈 Total Reward

Measures the accumulated reward throughout the simulation.

**Higher is better.**

### ⚖️ Cashier Utilization

Measures how efficiently the five cashiers are being utilized.

A good policy should avoid heavily overloaded cashiers while leaving others underutilized.

### 👥 Customer Distribution

Measures how customers are distributed among the five cashiers.

---

# 📈 Results

The final experiment compares **Q-Learning** and **SARSA** under the same environment and training conditions.

| Metric               | Q-Learning | SARSA |
| -------------------- | ---------: | ----: |
| Average Waiting Time |        TBD |   TBD |
| Average Reward       |        TBD |   TBD |
| Total Reward         |        TBD |   TBD |
| Cashier Utilization  |        TBD |   TBD |

> Replace the `TBD` values with your actual experimental results.

### 📊 Visualization

Add your generated comparison plots here:

```text
results/
├── waiting_time_comparison.png
├── reward_comparison.png
├── cashier_utilization.png
└── customer_distribution.png
```

Example:

```markdown
![Waiting Time Comparison](results/waiting_time_comparison.png)
```

---

# 🛠️ Technologies & Tools

* **Python**
* **Reinforcement Learning**
* **Q-Learning**
* **SARSA**
* **NumPy**
* **Pandas**
* **Matplotlib**
* **Jupyter Notebook**
* * **React**

---

# 📂 Project Structure

```text
Smart-Cashier-RL/
│
├── data/
│   └── ...
│
├── src/
│   ├── environment.py
│   ├── q_learning.py
│   ├── sarsa.py
│   ├── training.py
│   └── evaluation.py
│
├── notebooks/
│   └── experiments.ipynb
│
├── results/
│   ├── waiting_time_comparison.png
│   ├── reward_comparison.png
│   ├── cashier_utilization.png
│   └── customer_distribution.png
│
├── requirements.txt
├── README.md
└── .gitignore
```

---

# 🚀 Installation

Clone the repository:

```bash
git clone https://github.com/your-username/Smart-Cashier.git
```

Navigate to the project directory:

```bash
cd Smart-Cashier
```

Install the required dependencies:

```bash
pip install -r requirements.txt
```

---

# ▶️ Usage


1. Install dependencies:

   ```bash
   npm install
   ```

2. Run the application:

   ```bash
   npm run dev
   ```

3. Open the local development server in your browser and start experimenting with the Smart Cashier system.


---


## 👥 Team

Developed by a team of 6 members.

---
  
<div align="center">

⭐ **If this project helped you, consider giving it a star !** ⭐

</div>
