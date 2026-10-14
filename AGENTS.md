<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Auto-commit workflow

This project is edited directly in Antigravity instead of the Lovable web editor to save credits. After you finish making a requested code change and the change looks complete and working, automatically do the following yourself, without waiting for the user to ask:

1. Run `git add -A` to stage all changed files.
2. Run `git commit -m "<a short, clear message describing what changed>"` to commit.
3. Run `git push origin main` to push the commit to GitHub.

Do this after every change the user asks for, so the user only needs to type a prompt describing what they want changed — they should never need to run git commands themselves. Only skip the auto-commit if the change is broken, incomplete, or the user explicitly says not to commit yet.

Note: Pushing to `origin main` automatically deploys the site to `live.prateekmayani.com` via Cloudflare.
