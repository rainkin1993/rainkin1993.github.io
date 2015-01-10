    git checkout source
    jekyll build
    git rm .fuse_hidden*

    git add -A
    git commit -m "update source"

    cp -r _site/ /tmp/
    rm -r /tmp/_site
    cp -r _site/ /tmp
    ls -al /tmp/_site/

    git checkout master
    ls -al
    cp -rf /tmp/_site/* ./    
    ls -al

    git add -A
    git commit -m "update blog"
    git push origin master

    git checkout source
    echo "deploy succeed"
    git push origin source
    echo "push source"
