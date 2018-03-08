robocopy src docs /e
robocopy build\contracts docs
git add .
git commit -m "adding frontend files"
git push