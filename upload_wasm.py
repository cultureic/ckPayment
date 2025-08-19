#!/usr/bin/env python3

import sys
import subprocess

def wasm_to_candid_blob(wasm_file_path):
    """Convert WASM file to Candid blob format for dfx canister call"""
    try:
        with open(wasm_file_path, 'rb') as f:
            wasm_bytes = f.read()
        
        # Convert to hex string format
        hex_bytes = wasm_bytes.hex()
        
        # Format as Candid blob with colon separators
        candid_bytes = ':'.join(hex_bytes[i:i+2] for i in range(0, len(hex_bytes), 2))
        
        # Create Candid blob format
        candid_blob = f'(blob "{candid_bytes}")'
        
        return candid_blob
        
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        return None

def main():
    if len(sys.argv) != 2:
        print("Usage: python3 upload_wasm.py <wasm_file>", file=sys.stderr)
        sys.exit(1)
    
    wasm_file = sys.argv[1]
    candid_blob = wasm_to_candid_blob(wasm_file)
    
    if candid_blob:
        # Write to temporary file
        temp_file = '/tmp/wasm_candid_blob.txt'
        with open(temp_file, 'w') as f:
            f.write(candid_blob)
        
        print(f"Candid blob written to {temp_file}")
        print(f"File size: {len(candid_blob)} characters")
        
        # Execute dfx command using --argument-file
        cmd = [
            'dfx', 'canister', 'call', 
            'payment_backend', 'set_user_canister_wasm',
            '--argument-file', temp_file,
            '--network', 'ic'
        ]
        
        print("Executing dfx command...")
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, cwd='/Users/cesarangulo/Documents/icp/ckPayment')
            print("STDOUT:", result.stdout)
            if result.stderr:
                print("STDERR:", result.stderr)
            print("Return code:", result.returncode)
        except Exception as e:
            print(f"Error executing dfx command: {e}", file=sys.stderr)
    else:
        sys.exit(1)

if __name__ == '__main__':
    main()
