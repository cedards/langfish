{ pkgs ? import <nixpkgs> { } }:

with pkgs;
mkShell {
  buildInputs = [
    nodejs_26
    pnpm
    _1password-cli
    heroku
  ];

  # Set non-sensitive environment variables here,
  # execute arbitrary shell code, etc.
  # (like pull sensitive env vars from 1password cli)
  shellHook = ''
  '';
}
