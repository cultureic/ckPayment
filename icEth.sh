 dfx deploy icEth --argument "(variant {
    Init = record {
         ecdsa_key_name = \"dfx_test_key\";
         allowed_callers = (vec {principal \"dfx identity get-principal\"});
     }
  })"