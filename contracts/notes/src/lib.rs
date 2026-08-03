#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String};

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Payment(Address),
}

#[contracttype]
#[derive(Clone)]
pub struct PaymentRecord {
    pub amount: i128,
    pub status: String,
}

#[contract]
pub struct PaymentTracker;

#[contractimpl]
impl PaymentTracker {
    pub fn record_payment(env: Env, sender: Address, amount: i128, status: String) {
        sender.require_auth();
        if amount <= 0 {
            panic!("jumlah harus lebih dari 0");
        }
        let record = PaymentRecord { amount, status };
        env.storage().instance().set(&DataKey::Payment(sender), &record);
    }

    pub fn get_payment(env: Env, sender: Address) -> Option<PaymentRecord> {
        env.storage().instance().get(&DataKey::Payment(sender))
    }
}