import {
  StellarWalletsKit,
  WalletNetwork,
  allowAllModules,
} from "@creit.tech/stellar-wallets-kit";
import {
  Contract,
  TransactionBuilder,
  Networks,
  BASE_FEE,
  Address,
  nativeToScVal,
  scValToNative,
  rpc,
} from "@stellar/stellar-sdk";

const CONTRACT_ID = "CDY45CNG3GCN75L4Z77HOIYWAF57A3FQSL43TA3OQQRX4IBVBEW3EFA3";
const server = new rpc.Server("https://soroban-testnet.stellar.org");

const kit = new StellarWalletsKit({
  network: WalletNetwork.TESTNET,
  modules: allowAllModules(),
});

let currentAddress = null;
let pollInterval = null;

const app = document.getElementById("app");

function jsonReplacer(key, value) {
  return typeof value === "bigint" ? value.toString() : value;
}

function render() {
  app.innerHTML = `
    <div style="max-width:480px;margin:40px auto;font-family:sans-serif">
      <h1>Payment Tracker dApp</h1>
      ${
        !currentAddress
          ? `<button id="btnConnect">Connect Wallet</button>`
          : `
        <p><strong>Alamat:</strong> <code>${currentAddress}</code></p>
        <button id="btnDisconnect">Disconnect</button>
        <hr/>
        <form id="recordForm">
          <label>Jumlah</label>
          <input type="number" id="amount" required style="width:100%"/>
          <label>Status</label>
          <select id="status" style="width:100%">
            <option value="pending">pending</option>
            <option value="completed">completed</option>
          </select>
          <button type="submit">Record Payment</button>
        </form>
        <button id="btnFetch">Lihat Payment Tersimpan</button>
        <div id="result" style="margin-top:12px"></div>
        <hr/>
        <p><strong>Live status (auto-update tiap 5 detik):</strong></p>
        <div id="liveStatus"></div>
      `
      }
      <p id="errorMsg" style="color:red"></p>
    </div>
  `;

  document.getElementById("btnConnect")?.addEventListener("click", connect);
  document.getElementById("btnDisconnect")?.addEventListener("click", disconnect);
  document.getElementById("recordForm")?.addEventListener("submit", handleRecord);
  document.getElementById("btnFetch")?.addEventListener("click", handleFetch);
}

function showError(msg) {
  const el = document.getElementById("errorMsg");
  if (el) el.textContent = msg;
}

// --- ERROR TYPE 1: wallet belum connect ---
async function connect() {
  showError("");
  try {
    await kit.openModal({
      onWalletSelected: async (option) => {
        kit.setWallet(option.id);
        const { address } = await kit.getAddress();
        currentAddress = address;
        render();
        startPolling();
      },
    });
  } catch (err) {
    showError("Gagal connect wallet: " + err.message);
  }
}

function disconnect() {
  stopPolling();
  currentAddress = null;
  render();
}

async function handleRecord(e) {
  e.preventDefault();
  showError("");
  const resultEl = document.getElementById("result");

  if (!currentAddress) {
    showError("Wallet belum terhubung. Connect dulu.");
    return;
  }

  const amountInput = document.getElementById("amount").value;
  const status = document.getElementById("status").value;
  const amount = parseInt(amountInput, 10);

  // --- ERROR TYPE 2: input tidak valid ---
  if (!amount || amount <= 0) {
    showError("Jumlah harus lebih dari 0.");
    return;
  }

  resultEl.innerHTML = "<p>Mengirim transaksi...</p>";

  try {
    const account = await server.getAccount(currentAddress);
    const contract = new Contract(CONTRACT_ID);

    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        contract.call(
          "record_payment",
          nativeToScVal(Address.fromString(currentAddress), { type: "address" }),
          nativeToScVal(amount, { type: "i128" }),
          nativeToScVal(status, { type: "string" })
        )
      )
      .setTimeout(30)
      .build();

    const prepared = await server.prepareTransaction(tx);

    const signResult = await kit.signTransaction(prepared.toXDR(), {
      networkPassphrase: Networks.TESTNET,
      address: currentAddress,
    });

    const signedTx = TransactionBuilder.fromXDR(signResult.signedTxXdr, Networks.TESTNET);
    const sendResponse = await server.sendTransaction(signedTx);

    if (sendResponse.status !== "PENDING") {
      throw new Error("Transaksi ditolak network: " + sendResponse.status);
    }

    // polling status transaksi
    let getResponse = await server.getTransaction(sendResponse.hash);
    while (getResponse.status === "NOT_FOUND") {
      await new Promise((r) => setTimeout(r, 1500));
      getResponse = await server.getTransaction(sendResponse.hash);
    }

    if (getResponse.status === "SUCCESS") {
      resultEl.innerHTML = `
        <p style="color:green">Transaksi berhasil!</p>
        <p>Hash: <code>${sendResponse.hash}</code></p>
        <a href="https://stellar.expert/explorer/testnet/tx/${sendResponse.hash}" target="_blank">
          Lihat di Stellar Expert
        </a>
      `;
    } else {
      throw new Error("Transaksi gagal di ledger: " + getResponse.status);
    }
  } catch (err) {
    // --- ERROR TYPE 3: network/simulasi/contract call gagal ---
    resultEl.innerHTML = `<p style="color:red">Gagal: ${err.message}</p>`;
  }
}

async function handleFetch() {
  showError("");
  const resultEl = document.getElementById("result");
  if (!currentAddress) {
    showError("Wallet belum terhubung.");
    return;
  }
  try {
    const account = await server.getAccount(currentAddress);
    const contract = new Contract(CONTRACT_ID);
    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        contract.call(
          "get_payment",
          nativeToScVal(Address.fromString(currentAddress), { type: "address" })
        )
      )
      .setTimeout(30)
      .build();

    const sim = await server.simulateTransaction(tx);
    if (rpc.Api.isSimulationError(sim)) {
      throw new Error(sim.error);
    }
    const value = scValToNative(sim.result.retval);
    resultEl.innerHTML = `<pre>${JSON.stringify(value, jsonReplacer, 2)}</pre>`;
  } catch (err) {
    resultEl.innerHTML = `<p style="color:red">Gagal ambil data: ${err.message}</p>`;
  }
}

function startPolling() {
  if (pollInterval) clearInterval(pollInterval);
  pollInterval = setInterval(async () => {
    if (!currentAddress) return;
    try {
      const account = await server.getAccount(currentAddress);
      const contract = new Contract(CONTRACT_ID);
      const tx = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(
          contract.call(
            "get_payment",
            nativeToScVal(Address.fromString(currentAddress), { type: "address" })
          )
        )
        .setTimeout(30)
        .build();

      const sim = await server.simulateTransaction(tx);
      if (!rpc.Api.isSimulationError(sim)) {
        const value = scValToNative(sim.result.retval);
        const liveEl = document.getElementById("liveStatus");
        if (liveEl) liveEl.innerHTML = `<pre>${JSON.stringify(value, jsonReplacer, 2)}</pre>`;
      }
    } catch (err) {
      // silent fail saat polling, tidak perlu ganggu UI utama
    }
  }, 5000); // polling tiap 5 detik
}

function stopPolling() {
  if (pollInterval) clearInterval(pollInterval);
  pollInterval = null;
}

render();