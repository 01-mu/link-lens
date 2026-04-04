{
  description = "LinkLens development shell";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
          config.allowUnfree = true;
        };
      in
      {
        devShells.default = pkgs.mkShell {
          packages = with pkgs; [
            bun
            terraform
            wrangler
            git
            curl
            jq
          ];

          shellHook = ''
            echo "LinkLens dev shell ready."
            echo "Install dependencies with: bun install"
          '';
        };
      });
}
