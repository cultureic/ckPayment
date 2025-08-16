use std::env;
use std::fs;
use std::path::Path;

fn main() {
    let out_dir = env::var_os("OUT_DIR").unwrap();
    let dest_path = Path::new(&out_dir).join("user_payment_canister_wasm.rs");

    // Try to find the user payment canister WASM file
    let wasm_paths = [
        "../../.dfx/ic/canisters/user_payment_canister/user_payment_canister.wasm",
        "../../.dfx/local/canisters/user_payment_canister/user_payment_canister.wasm",
        "../../target/wasm32-unknown-unknown/release/user_payment_canister.wasm",
        "../user_payment_canister/target/wasm32-unknown-unknown/release/user_payment_canister.wasm",
    ];

    let mut wasm_data = None;
    for path in &wasm_paths {
        if let Ok(data) = fs::read(path) {
            wasm_data = Some(data);
            println!("cargo:warning=Found user payment canister WASM at: {}", path);
            break;
        }
    }

    let wasm_bytes = match wasm_data {
        Some(data) => data,
        None => {
            println!("cargo:warning=User payment canister WASM not found, using empty placeholder");
            vec![]
        }
    };

    let code = format!(
        "pub const USER_PAYMENT_CANISTER_WASM: &[u8] = &{:?};",
        wasm_bytes
    );

    fs::write(&dest_path, code).unwrap();

    // Rerun if any of the WASM files change
    for path in &wasm_paths {
        if Path::new(path).exists() {
            println!("cargo:rerun-if-changed={}", path);
        }
    }
}
