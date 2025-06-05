const API_NBU = "https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?valcode=USD&json";
let dealId = null;
let nbuRate = null;
const currencyRateField = 'currency_rate';

function showError(message) {
  const errorEl = document.getElementById('error_message');
  errorEl.innerText = message;
  errorEl.classList.remove('hidden');
  logAction(`${message}`);
}

function showSuccess(message) {
  const successEl = document.getElementById('success_message');
  successEl.innerText = message;
  successEl.classList.remove('hidden');
  logAction(`${message}`);

  setTimeout(() => {
    successEl.classList.add('hidden');
  }, 3000);
}

function logAction(message) {
  const logList = document.getElementById('log_list');
  const item = document.createElement('li');
  const time = new Date().toLocaleTimeString();
  item.textContent = `[${time}] ${message}`;
  logList.prepend(item);
}

window.addEventListener('DOMContentLoaded', () => {
  ZOHO.embeddedApp.on("PageLoad", async function (data) {
    dealId = Array.isArray(data.EntityId) ? data.EntityId[0] : data.EntityId;
    if (!dealId) return;

    try {
      nbuRate = await fetchNbuRate();
      document.getElementById('nbu_rate').innerText = nbuRate.toFixed(2);
      logAction(`Fetched NBU rate: ${nbuRate.toFixed(2)}`);

      const dealData = await getDealData(dealId);
      logAction(`Loaded deal data (ID: ${dealId})`);

      const rawDealRate = dealData[currencyRateField];
      const dealRate = rawDealRate ? parseFloat(rawDealRate) : '';

      const dealInput = document.getElementById('deal_rate_input');
      dealInput.value = dealRate !== '' ? dealRate.toFixed(2) : '';

      if (dealRate !== '') {
        updateDifferenceAndButton(dealRate);
      }

      dealInput.addEventListener('input', () => {
        const inputValue = parseFloat(dealInput.value);
        if (!isNaN(inputValue)) {
          updateDifferenceAndButton(inputValue);
        } else {
          document.getElementById('diff').innerText = '—';
          document.getElementById('update_btn').classList.add('hidden');
        }
      });
    } catch (err) {
      showError("Unexpected error during initialization.");
    }
  });

  ZOHO.embeddedApp.init();
});

async function fetchNbuRate() {
  try {
    const res = await fetch(API_NBU);
    const data = await res.json();
    const rate = data[0].rate;
    localStorage.setItem('last_nbu_rate', rate);
    return rate;
  } catch {
    showError("Failed to fetch NBU rate. Using the last saved value.");
    logAction("Using cached NBU rate due to fetch failure.");

    const savedRate = localStorage.getItem('last_nbu_rate');
    if (savedRate) {
      return parseFloat(savedRate);
    } else {
      showError("NBU rate is unavailable and no cached value was found.");
      throw new Error("NBU rate unavailable and no cached value found.");
    }
  }
}

async function getDealData(id) {
  try {
    const response = await ZOHO.CRM.API.getRecord({
      Entity: "Deals",
      RecordID: id,
    });

    if (!response || !response.data || response.data.length === 0) {
      showError("Failed to load deal data.");
      throw new Error("No deal data found.");
    }

    return response.data[0];
  } catch {
    showError("Unable to retrieve deal from Zoho CRM.");
    throw new Error("getDealData failed");
  }
}

function updateDifferenceAndButton(dealRate) {
  const diff = ((dealRate / nbuRate - 1) * 100).toFixed(1);
  document.getElementById('diff').innerText = diff;
  logAction(`Calculated difference: ${diff}%`);

  const updateBtn = document.getElementById('update_btn');
  if (Math.abs(diff) >= 5) {
    updateBtn.classList.remove('hidden');
    updateBtn.onclick = () => updateDealRate(dealId, nbuRate);
  } else {
    updateBtn.classList.add('hidden');
  }
}

async function updateDealRate(id, rate) {
  const btn = document.getElementById('update_btn');
  const spinner = document.getElementById('update_spinner');
  const btnText = document.getElementById('update_btn_text');

  btn.disabled = true;
  spinner.classList.remove('hidden');
  btnText.textContent = 'Updating...';

  logAction(`Update clicked. Sending rate: ${rate.toFixed(2)}`);

  try {
    const result = await ZOHO.CRM.API.updateRecord({
      Entity: "Deals",
      RecordID: id,
      APIData: {
        id: id,
        [currencyRateField]: Number(rate),
      },
    });

    if (result && result.data && result.data[0].status === "success") {
      showSuccess("Rate has been updated in the deal.");
      logAction(`Updated deal ID ${id} with NBU rate: ${rate.toFixed(2)}`);

      const dealInput = document.getElementById('deal_rate_input');
      dealInput.value = rate.toFixed(2);

      updateDifferenceAndButton(rate);
    } else {
      showError("Failed to update rate in CRM. Please try again.");
      logAction("Update returned error status.");
    }
  } catch {
    showError("Unexpected error occurred while updating the rate.");
    logAction("Update failed due to exception.");
  } finally {
    spinner.classList.add('hidden');
    btn.disabled = false;
    btnText.textContent = 'Update Deal Rate';
  }
}