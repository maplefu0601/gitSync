<?php

	echo "convert md files to pdf\n";
	echo '<pre>'; print_r($_GET); echo $argv[1]; echo '< /pre>';

	function convertToPdf($folder) {
		echo "converting ".$folder."\n\n";

		$pd = $folder.".pd";
		$pdf = $folder.".pdf";
		$cmd = "cd ".$folder." && mkdocs2pandoc > ".$pd." && pwd && pandoc --toc -f markdown+grid_tables+table_captions -o ".$pdf." ".$pd;
		
		echo $cmd."\n";
		shell_exec($cmd." 2>&1; echo $?\n");
	}

	convertToPdf($argv[1]);
?>

