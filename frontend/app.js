// freighter-api & stellar-sdk di-load lewat <script> UMD di index.html
const freighterApi = window.freighterApi;
const { Horizon, TransactionBuilder, Networks, Operation, Asset, BASE_FEE } = window.StellarSdk;

const server = new Horizon.Server("https://horizon-testnet.stellar.org");

const el = {
  disconnected: document.getElementById("disconnected"),
  connected: document.getElementById("connected"),
  address: document.getElementById("address"),
  balance: document.getElementById("balance"),
  btnConnect: document.getElementById("btnConnect"),
  btnDisconnect: document.getElementById("btnDisconnect"),
  btnFund: document.getElementById("btnFund"),
  sendForm: document.getElementById("sendForm"),
  destination: document.getElementById("destination"),
  amount: document.getElementById("amount"),
  txResult: document.getElementById("txResult"),
  errorMsg: document.getElementById("errorMsg"),
};

let currentAddress = null;

async function refreshBalance(pubKey) {
  el.balance.textContent = "memuat...";
  try {
    const account = await server.loadAccount(pubKey);
    const native = account.balances.find((b) => b.asset_type === "native");
    if (native) {
      el.balance.textContent = `${native.balance} XLM`;
      el.btnFund.style.display = "none";
    } else {
      el.balance.textContent = "0 XLM";
    }
  } catch (err) {
    if (err?.response?.status === 404) {
      el.balance.textContent = "Akun belum ter-fund";
      el.btnFund.style.display = "inline-block";
    } else {
      showError(err.message);
    }
  }
}

function showConnected(address) {
  currentAddress = address;
  el.address.textContent = address;
  el.disconnected.style.display = "none";
  el.connected.style.display = "block";
  refreshBalance(address);
}

function showDisconnected() {
  currentAddress = null;
  el.disconnected.style.display = "block";
  el.connected.style.display = "none";
  el.txResult.innerHTML = "";
}

function showError(msg) {
  el.errorMsg.textContent = msg;
}

// --- init: cek kalau sudah pernah connect sebelumnya ---
(async () => {
  const allowed = await freighterApi.isAllowed();
  if (allowed.isAllowed) {
    const result = await freighterApi.getAddress();
    if (result.address) showConnected(result.address);
  }
})();

el.btnConnect.addEventListener("click", async () => {
  showError("");
  try {
    const isConnected = await freighterApi.isConnected();
    if (!isConnected.isConnected) {
      throw new Error(
        "Freighter belum terpasang. Install di https://www.freighter.app/",
      );
    }
    const access = await freighterApi.requestAccess();
    if (access.error) throw new Error(access.error);

    const network = await freighterApi.getNetwork();
    if (network.network !== "TESTNET") {
      throw new Error("Ganti network Freighter kamu ke Testnet dulu.");
    }

    showConnected(access.address);
  } catch (err) {
    showError(err.message);
  }
});

el.btnDisconnect.addEventListener("click", () => {
  showDisconnected();
});

el.btnFund.addEventListener("click", async () => {
  showError("");
  try {
    const res = await fetch(
      `https://friendbot.stellar.org?addr=${encodeURIComponent(currentAddress)}`,
    );
    if (!res.ok) throw new Error("Gagal fund akun via Friendbot.");
    await refreshBalance(currentAddress);
  } catch (err) {
    showError(err.message);
  }
});

el.sendForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  showError("");
  el.txResult.innerHTML = "<p>Mengirim...</p>";

  try {
    const destination = el.destination.value.trim();
    const amount = el.amount.value.trim();

    const account = await server.loadAccount(currentAddress);
    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.payment({
          destination,
          asset: Asset.native(),
          amount,
        }),
      )
      .setTimeout(180)
      .build();

    const signResult = await freighterApi.signTransaction(tx.toXDR(), {
      networkPassphrase: Networks.TESTNET,
      address: currentAddress,
    });
    if (signResult.error) throw new Error(signResult.error);

    const signedTx = TransactionBuilder.fromXDR(
      signResult.signedTxXdr,
      Networks.TESTNET,
    );
    const sendResponse = await server.submitTransaction(signedTx);

    el.txResult.innerHTML = `
      <p class="success">Transaksi berhasil!</p>
      <p>Hash: <code>${sendResponse.hash}</code></p>
      <a href="https://stellar.expert/explorer/testnet/tx/${sendResponse.hash}" target="_blank">
        Lihat di Stellar Expert
      </a>
    `;
    refreshBalance(currentAddress);
  } catch (err) {
    el.txResult.innerHTML = `<p class="error">Gagal: ${err.message}</p>`;
  }
});
