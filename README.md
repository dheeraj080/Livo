# 🏰 Mind Palace

**Mind Palace** is a minimalist, high-performance note-taking application designed for clarity and focus. It blends the structural reliability of a "Palace" with a fluid, native-feeling editor inspired by high-end design systems like Apple Notes and Linear.



---

## ✨ Key Features

* **Adaptive Theme Engine**: Seamlessly transitions between a clean "Legal Pad" light mode and a deep "Studio" dark mode.
* **Pro-Level Checklist**: Intelligent focus management with keyboard shortcuts (`Enter` to create, `Backspace` to delete).
* **Zero-Latency Auto-Sync**: Your thoughts are saved to the "Palace" in real-time with an integrated auto-save status indicator.
* **Native Feel**: Built with high-fidelity animations using **Framer Motion** and a responsive layout using **Tailwind CSS**.
* **Minimalist Canvas**: A distraction-free writing environment that auto-hides complex actions until you hover, keeping your "Mind Palace" clutter-free.

---

## 🛠 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React + Vite |
| **Styling** | Tailwind CSS (v3) |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |
| **API Client** | Axios |
| **Feedback** | React Hot Toast |

---

## 🚀 Getting Started

### Prerequisites
* **Node.js** (v18 or higher)
* **NPM** or **Yarn**

### Installation

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/yourusername/mind-palace.git](https://github.com/yourusername/mind-palace.git)
    cd mind-palace
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables**
    Create a `.env` file in the root directory and add your backend endpoint:
    ```env
    VITE_API_URL=[https://your-api-url.com](https://your-api-url.com)
    ```

4.  **Launch Development Server**
    ```bash
    npm run dev
    ```

---

## ⌨️ Keyboard Shortcuts (Checklist Mode)

To make writing as fast as thinking, the checklist supports standard markdown-style behavior:

| Shortcut | Action |
| :--- | :--- |
| `Enter` | Create a new checklist item immediately below the current one. |
| `Backspace` | If the item is empty, delete the row and move focus to the previous item. |



---

## 🏗 Project Structure

```text
src/
├── components/     # UI Building blocks (Logo, Checklist, etc.)
├── lib/            # Configuration (Axios instances)
├── pages/          # Full-page views (Home, Create, Detail)
└── App.jsx         # Routing and Global Theme Provider
