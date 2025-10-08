{ pkgs ? import <nixpkgs> { } }:

with pkgs;
mkShell {
  buildInputs = [
    nodejs_18
    nodePackages_latest.pnpm
    nodePackages_latest.yarn
    _1password
    heroku
  ];

  # Set non-sensitive environment variables here,
  # execute arbitrary shell code, etc.
  # (like pull sensitive env vars from 1password cli)
  shellHook = ''
  '';
}
